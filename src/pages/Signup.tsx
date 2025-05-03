import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function Signup() {
    const { t } = useTranslation();
    return (
        <form className="mx-auto shadow-md bg-[#FBFAFA] dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 shadow-neutral-300 dark:shadow-neutral-700 p-14 rounded-lg max-w-md w-full mb-10">
            <h1 className="font-bold  text-[#1A202C] dark:text-gray-700 text-2xl mb-10 w-fit mx-auto">{t('signUpTitle')}</h1>
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
            <div>
                <label htmlFor="password" className="block dark:text-white">{t('signUpPassword')}<span className="text-red-500"> *</span></label>
                <input type="password" name="password" id="password" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            <div>
                <label htmlFor="passwordConfirm" className="block dark:text-white">{t('signUpPasswordConfirm')}<span className="text-red-500"> *</span></label>
                <input type="password" name="passwordConfirm" id="passwordConfirm" className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"/>
            </div>
            <button className="bg-brand font-bold text-white w-full rounded-sm p-1">
                {t('signUpSubmit')}
            </button>
            <p className="text-sm w-fit mx-auto mt-3 dark:text-white">{t('signUpAlready')} <Link to="#" className="text-brand">{t('logInSubmit')}</Link></p>
        </form>
    )
}

export default Signup
