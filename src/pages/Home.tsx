import { useTranslation } from "react-i18next";
import { AiOutlineSearch } from "react-icons/ai";
import { BrowserRouter, Routes } from "react-router-dom";
function Home() {
     const { t } = useTranslation();
    return (
        <div className="max-w-3xl mx-5 h-fit my-auto flex flex-col items-center md:mx-auto ">
          <img src="./logoTwo.svg" alt="Logo" className="dark:invert " />
          <form className="bg-[#E2E8F0] dark:bg-gray-800 dark:text-white flex items-center space-x-4 p-2 rounded-full w-full shadow-sm shadow-neutral-400 dark:shadow-gray-500 focus-within:bg-white dark:focus-within:bg-black">
            <AiOutlineSearch size={30} className="text-brand2" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full outline-none"
            />
          </form>
          <p className="mt-20 text-neutral-500">{t("explainer")}</p>
        </div>
    )
}

export default Home
