import { t } from "i18next"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AiOutlineClose } from "react-icons/ai"
import { BiSolidErrorCircle } from "react-icons/bi"
import { BsChevronLeft } from "react-icons/bs"

interface Props {
    onClose: ()=>void
}
const TopUp = ({onClose}:Props) => {
        const { t } = useTranslation();
    const [step, setStep] = useState(0)
   const steps = [
    {id: 1 },
    {id: 2 }
]
const nextStep = ()=> {
setStep(step + 1)
}
const prevStep = ()=>{
    setStep(step-1)
}
    return (
        <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-neutral-900/90 flex items-center justify-center overflow-hidden">
            <div className="bg-white  dark:bg-black sm:min-w-80 lg:min-w-sm rounded-lg max-h-lvh md:h-3/4 md:w-xl overflow-y-auto relative">
            <div className="p-10 h-full justify-items-center">
                <AiOutlineClose onClick={onClose} className="absolute top-5 right-5 cursor-pointer dark:text-white"/>
                <BsChevronLeft onClick={prevStep} className={`absolute top-5 left-5 cursor-pointer dark:text-white ${step===0 && 'hidden'}`}/>
                    {steps.map((s, index)=>
                <div key={s.id} className={`mt-3 w-full h-full justify-items-center ${index===step ? 'block': 'hidden'}`}>
                    {
                        index===0 ?

                    <div>
                    <div className="border rounded-lg p-3 md:w-md mb-5 border-red-500 bg-red-50 dark:bg-red-950/50 text-red-500 flex space-x-2">
                    <div className="bg-white dark:bg-black rounded-full w-fit h-fit p-1 flex items-center justify-center">
                    <BiSolidErrorCircle className="size-6"/>
                    </div>
                    <div>
                        <h2 className="font-semibold">{t('insufficientBalance')}</h2>
                        <p className="max-w-72 text-sm">{t('iBMessage')} <span className="font-bold">2,630 RWF</span>
                        </p>
                    </div>
                </div>
                <h1 className="text-neutral-400 font-bold text-xl mb-5">{t('currentBalance')} <span className="text-black dark:text-white">0.0 RWF</span></h1>
                <div className="font-bold text-xl mb-5 flex items-center space-x-5">
                <label htmlFor="topUpAmount" className="text-neutral-400">{t('add')}</label>
                <input type="text" name="topUpAmount" className="outline-none border border-neutral-300 dark:border-neutral-700 rounded-md p-1 pl-3 ml-5 dark:text-white" />
                <span className="dark:text-white">RWF</span>
                </div>
                <div className="m-10 mb-5 pt-5 space-y-4">

                <button onClick={nextStep} className="flex items-center w-full p-2 rounded-lg justify-between bg-[#FFCA06] text-[#004F70] font-bold cursor-pointer active:scale-95">
                    <span className="w-full">

                    {t('topup')} {t('with')} MTN MoMo
                    </span>
                    <img src="./mtnLogo.svg" alt="Logo" className="size-8"/>
                    </button>
                <button className="flex items-center w-full p-2 rounded-lg justify-between bg-[#EC1C24] text-white font-bold cursor-pointer active:scale-95">
                    <span className="w-full ">

                    {t('topup')} {t('with')} Airtel Money
                    </span>
                    <img src="./airtelLogo.svg" alt="Logo" className="size-8"/>
                    </button>
                </div>
                    </div>
                        : <ConfirmNumber/>
                    }

                </div>
                    )}
            </div>
            </div>
            
        </div>
    )
}

export default TopUp

const ConfirmNumber = () =>(
    <div className="font-bold text-xl mb-5  w-full h-full flex items-center">
        <div className=" w-full">

    <label htmlFor="topUpPhone" className="text-neutral-400 block">{t('signUpPhone')} <span className="text-red-500"> *</span></label>
    <input type="text" id="topUpPhone" className="outline-none border border-neutral-300 dark:border-neutral-700 rounded-md p-1 pl-3 mb-10 w-full dark:text-white" />
    <button className="w-full p-2 rounded-lg text-white bg-brand font-bold cursor-pointer active:scale-95">

                    {t('topup')} 
                    </button>
        </div>
    </div>
)