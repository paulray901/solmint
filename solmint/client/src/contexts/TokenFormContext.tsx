/**
 * SolMint TokenFormContext
 * Manages the 3-step token creation wizard state
 */
import { createContext, useContext, useState } from "react";

export interface TokenFormData {
  // Step 1 — Token Details
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  description: string;
  revokeMintAuthority: boolean;

  // Step 2 — Token Branding
  logoFile: File | null;
  logoPreviewUrl: string;
  logoIpfsUri: string;
  websiteUrl: string;
  twitterUrl: string;
  telegramUrl: string;
}

interface TokenFormContextType {
  formData: TokenFormData;
  updateFormData: (updates: Partial<TokenFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const defaultFormData: TokenFormData = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: "1000000000",
  description: "",
  revokeMintAuthority: true,
  logoFile: null,
  logoPreviewUrl: "",
  logoIpfsUri: "",
  websiteUrl: "",
  twitterUrl: "",
  telegramUrl: "",
};

const TokenFormContext = createContext<TokenFormContextType>({
  formData: defaultFormData,
  updateFormData: () => {},
  currentStep: 1,
  setCurrentStep: () => {},
  resetForm: () => {},
});

export function TokenFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<TokenFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<TokenFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(1);
  };

  return (
    <TokenFormContext.Provider
      value={{ formData, updateFormData, currentStep, setCurrentStep, resetForm }}
    >
      {children}
    </TokenFormContext.Provider>
  );
}

export function useTokenForm() {
  return useContext(TokenFormContext);
}
