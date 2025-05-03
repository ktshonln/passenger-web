import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const [choice, setChoice] = useState("phone");
  return (
    <form className="mx-auto shadow-md bg-[#FBFAFA] dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800  shadow-neutral-300 dark:shadow-neutral-700 p-14 rounded-lg max-w-md w-full mb-10">
      <h1 className="font-bold  text-[#1A202C] dark:text-gray-700 text-2xl mb-10 w-fit mx-auto">
        {t("logInTitle")}
      </h1>

      <div>
        <select
          name=""
          id=""
          value={choice}
          className="outline-none dark:text-white"
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setChoice(e.target.value)
          }
        >
          <option value="phone" className="text-black">
            <label htmlFor="phone">
              {t("signUpPhone")}
            </label>
          </option>
          <option value="email" className="text-black">
            <label htmlFor="email">
            {t("signUpEmail")}
            </label>
            </option>
        </select>
        <span className="text-red-500"> *</span>
        <input
          type={choice === "phone" ? "tel" : "email"}
          name={choice === "phone" ? "phone" : "email"}
          id={choice === "phone" ? "phone" : "email"}
          className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="password" className="block dark:text-white">
          {t("signUpPassword")}
          <span className="text-red-500"> *</span>
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="outline-none border border-neutral-300 dark:border-neutral-700 w-full rounded-sm p-1 mb-5 dark:text-white"
        />
      </div>

      <button className="bg-brand font-bold text-white w-full rounded-sm p-1">
        {t("logInSubmit")}
      </button>
      <p className="text-sm w-fit mx-auto mt-3 dark:text-white">
        {t("logInAlready")}{" "}
        <span className="text-brand">{t("signUpSubmit")}</span>
      </p>
    </form>
  );
}

export default Login;
