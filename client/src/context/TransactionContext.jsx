import { useEffect, useState, createContext } from 'react';
import { ethers } from 'ethers';

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
    const [ transactionCount, setTransactionCount ] = useState(0);
    
    const handleChange = (e) => setFormData(prevState => ({...prevState, [e.target.name]: e.target.value }));
    
    const checkIfWalletConnected = async () => {
        try {
            if (!ethereum) {
                return alert('Please install Metamask');
            }
    
            const accounts = await ethereum.request({method: 'eth_accounts'});
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log('no accounts found')
            }
            
    
        } catch(e) {
            console.log('error', e.message);
            throw new Error('no ethereum object')
        }
        
    };

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
            setIsLoading(false);
            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch(e) {
            console.log(e.message)
        }
    };

    useEffect(() => checkIfWalletConnected(), [] )
    
    return (
        <TransactionContext.Provider 
            value={{ 
                connectWallet, 
                handleChange,
                sendTransaction,
                currentAccount, 
                formData, 
                setFormData, 
            }}>
            {children}
        </TransactionContext.Provider>
    );
}    
