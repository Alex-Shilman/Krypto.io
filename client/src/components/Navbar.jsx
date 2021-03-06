import { useState } from 'react';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

import logo from '../../images/logo.png';

const NavbarItem = ({ title, className = '' }) => {
    return (
        <li className={`mx-4 cursor-pointer ${className}`}>
            {title}
        </li>
    )
}

const Navbar = () => {
    const [ toggleMenu, setToggleMenu ] = useState(false);
    const links = [
        'Markets',
        'Exchange',
        'Tutorials',
        'Wallets',
    ];
    const ToggleButton = toggleMenu ? AiOutlineClose : HiMenuAlt4;
    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="md:flex-[0.5] flex-initial justify-center items-center">
                <img className="w-32 cursor-pointer" src={logo} alt="logo"/>
            </div>
            <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
                {links.map(title => <NavbarItem key={title} title={title} />)}
                <li className="bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]">Login</li>
            </ul>
            <div className="flex relative">
                <ToggleButton 
                    fontSize="28" 
                    className="text-white md:hidden cursor-pointer z-20" 
                    onClick={() => setToggleMenu(!toggleMenu)}
                />
                {
                    toggleMenu && (
                        <ul className="z-10 fixed top-0 -right-2 p-3 w-[100vw] h-screen shadow-2xl md:hidden list-none flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in">
                            <li className="text-xl w-full my-2 invisible">
                                <AiOutlineClose onClick={() => setToggleMenu(false)}/>
                            </li>
                            {links.map(title => <NavbarItem key={title} title={title} className="my-2 text-lg"/>)}
                        </ul>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar;