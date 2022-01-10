import { useEffect, useState, createContext } from 'react';
import { get, parseInt } from 'lodash';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = createContext();


const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionContract;
}

export const TransactionProvider = ({ children }) => {
    const initialTransactionState = { addressTo: '', amount: '',  keyword: '', message: '' };
    const [ currentAccount, setCurrentAccount ] = useState('');
    const [ formData, setFormData ] = useState(initialTransactionState);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ transactionCount, setTransactionCount ] = useState(() => window.localStorage.getItem('transactionCount'));
    const [ transactions, setTransactions ] = useState([]);
    
    const handleChange = (e) => setFormData(prevState => ({...prevState, [e.target.name]: e.target.value }));
   
    const getAllTransactions = async () => {
        try {
            if (!ethereum) {
                return alert('Please install Metamask');
            }
            const transactionContract = getEthereumContract();
            const availabeTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availabeTransactions.map(transaction => ({
                id: uuidv4(),
                addressTo: get(transaction, 'receiver'),
                addressFrom: get(transaction, 'sender'),
                timestamp: new Date(get(transaction, 'timestamp').toNumber() * 1000).toLocaleString(),
                message: get(transaction, 'message'),
                keyword: get(transaction, 'keyword'),
                amount: parseInt(get(transaction, 'amount._hex')) / (10**18),
            }));

            setTransactions(structuredTransactions);

        } catch (e) {
            console.log('error', e.message);
            throw new Error('no ethereum object')
        }
    };
    
    const checkIfWalletConnected = async () => {
        try {
            if (!ethereum) {
                return alert('Please install Metamask');
            }
    
            const accounts = await ethereum.request({method: 'eth_accounts'});
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log('no accounts found')
            }
            
    
        } catch(e) {
            console.log('error', e.message);
            throw new Error('no ethereum object')
        }
        
    };

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
            window.localStorage.setItem('transactionCount', transactionCount);
        } catch (e) {
            console.log('error', e.message);
            throw new Error('no ethereum object')
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                return alert('Please install Metamask');
            }
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
        } catch(e) {
            console.log('error', e.message);
            throw new Error('no ethereum object')
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please install metamask');
            const { addressTo, amount, keyword, message } = formData;   
            const transactionContract = getEthereumContract();
            transactionContract.on("Transfer", (to, amount, from) => {
                setIsLoading(false);
                getAllTransactions();
            });
            const parsedAmount = ethers.utils.parseEther(amount);
            setIsLoading(true);
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208',
                        value: parsedAmount._hex,
                    }
                ]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            console.log(`Loading - ${transactionHash.hash}`);
            transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            // setIsLoading(false);
            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch(e) {
            console.log(e.message)
        }
    };

    useEffect(() => {
        checkIfWalletConnected();
        checkIfTransactionsExist();
    }, [] )
    
    return (
        <TransactionContext.Provider 
            value={{ 
                connectWallet, 
                handleChange,
                sendTransaction,
                setFormData, 
                transactions,
                isLoading,
                currentAccount, 
                formData, 
            }}>
            {children}
        </TransactionContext.Provider>
    );
}    
