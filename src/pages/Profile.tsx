import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BiSolidWallet } from "react-icons/bi";
import { Link } from "react-router-dom";
import TopUp from "../components/TopUp";

function Profile() {
    const { t } = useTranslation();
    const [topUpPrompt, setTopUpPrompt] = useState(false)
    
    return (
        <div>
        <form className="mx-auto shadow-md bg-[#FBFAFA] dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 shadow-neutral-300 dark:shadow-neutral-700 p-14 rounded-lg max-w-md w-full mb-10">
            <h1 className="font-bold  text-[#1A202C] dark:text-gray-700 text-2xl mb-10 w-fit mx-auto">{t('profileTitle')}</h1>
            <div>
                <label htmlFor="firstName" className="block dark:text-white">{t('signUpFirstName')}<span className="text-red-500"> *</span></label>
                <input type="text" name="firstName" id="firstName" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            <div>
                <label htmlFor="lastName" className="block dark:text-white">{t('signUpLastName')}<span className="text-red-500"> *</span></label>
                <input type="text" name="lastName" id="lastName" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            <div>
                <label htmlFor="email" className="block dark:text-white">{t('signUpEmail')}</label>
                <input type="email" name="email" id="email" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            <div>
                <label htmlFor="phone" className="block dark:text-white">{t('signUpPhone')}<span className="text-red-500"> *</span></label>
                <input type="tel" name="phone" id="phone" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            
            <button className="bg-brand font-bold text-white w-full rounded-sm p-1 cursor-pointer">
                {t('profileSubmit')}
            </button>
        </form>
        <div className="mx-auto shadow-md bg-[#FBFAFA] dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 shadow-neutral-300 dark:shadow-neutral-700 p-14 pt-3 pb-5 rounded-lg max-w-md w-full mb-10 mt-32">
        <div className="flex items-center space-x-2">
        <h1 className="font-bold  text-[#1A202C] dark:text-gray-700 text-2xl ">{t('wallet')}</h1><BiSolidWallet className="text-[#008000] size-6"/>

        </div>
        <div className="border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 mt-3 dark:text-white flex items-center justify-between">
            <div className="flex items-center">

                <p className="mr-5">12,999.2</p>
                <p className="block text-neutral-500 font-medium">RWF</p>
            </div>
            
            <button onClick={()=>setTopUpPrompt(true)} className="bg-brand font-bold text-white  pl-3 pr-3 text-sm rounded-sm p-0.5 mr-2 cursor-pointer active:scale-95">
                {t('topup')}
            </button>

        </div>
        <p className="text-sm w-fit mx-auto mt-3 dark:text-white">

         <Trans // A Trans component gives you more customization capabilities
        i18nKey='walletNotice'
        values={{item:t('termsAndConditions')}}
        components={{
            1: <Link to="/terms-and-conditions" className="text-brand"/>
        }}
        /> 
        </p>
        </div>
        {
           topUpPrompt && <TopUp onClose={()=>setTopUpPrompt(false)}/> 
        }
        </div>
    )
}

export default Profile
