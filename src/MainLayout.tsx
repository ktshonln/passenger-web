import { GrLanguage } from "react-icons/gr";
import DarkModeToggle from "./components/DarkModeToggle";
import { changeLanguage } from "i18next";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  ReactElement,
  useState,
} from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { Link, Outlet } from "react-router-dom";
import { BiSolidUserCircle } from "react-icons/bi";



type Language = "en" | "kiny";

const MainLayout = () => {
  const { t } = useTranslation();
  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
  };
  const currentYear = new Date().getFullYear();
  const [show, setShow] = useState(false)
  return (
    <div className="font-heebo dark:bg-black flex flex-col justify-between h-screen">
      {/* Header */}
      <header className="flex items-center justify-between m-3 mt-0  dark:text-white">
        <Link to='/'>
        <img src="./logoOne.svg" alt="Logo" className="dark:invert" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1">
            <GrLanguage />
            <select
              name=""
              id=""
              value={i18n.language} // Initialize with set language to avoid selection glitch
              className="outline-none"
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                changeLanguage(e.currentTarget.value as Language)
              }
            >
              <div className="text-black p-20">
                <option value="kiny" className="w-fit">KINY</option>
                <option value="en" className="w-fit p-5">EN</option>
              </div>
            </select>
          </div>
          <DarkModeToggle />
          <div className="space-x-2">
          <Link to={'/login'} className="font-semibold p-1 pl-6 pr-6 border border-neutral-300 rounded-full">
            {t("login")}
          </Link>
          <Link to='/signup' className="font-semibold p-1 pl-6 pr-6 border border-neutral-300 rounded-full">
            {t("signup")}
          </Link>
          </div>
          <div className="relative">

          <BiSolidUserCircle onClick={()=>setShow(!show)} className="text-neutral-300 cursor-pointer" size={51}/>
            {show &&
              <div onClick={()=>setShow(false)} className="absolute right-1 top-14 bg-white dark:bg-black dark:shadow-neutral-800 shadow-md w-44 pt-2 pb-2 border border-neutral-200 dark:border-neutral-800   rounded-md">
                <Link to='/profile' className="hover:bg-[#ECF4FF] dark:hover:text-black p-0.5 pl-3 cursor-pointer w-full block">{t('profile')}</Link>
                <p className="hover:bg-[#ECF4FF] dark:hover:text-black p-0.5 pl-3 cursor-pointer">{t('logout')}</p>
              </div>
            }
          </div>
        </div>
      </header>
      {/* Main */}
      <main className="dark:bg-black" ><Outlet /></main>
      {/* Footer */}
      <footer className="bg-[#EDF2F7] dark:bg-gray-900 p-10">
        <hr className="text-brand2   mr-5 ml-5" />
        <div className="flex items-center space-x-5 w-fit mx-auto mt-10">
          <p className="font-semibold text-[#607693]">{t("privacy")}</p>
          <p className="font-semibold text-[#607693]">{t("terms")}</p>
          <p className="font-semibold text-[#607693]">{t("contact")}</p>
        </div>
        <p className="w-fit mx-auto text-sm text-neutral-500 mt-2">
          © {currentYear} Katisha Online. {t("allRights")}
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;
