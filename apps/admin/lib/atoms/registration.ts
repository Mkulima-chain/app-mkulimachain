import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type FamilyRole = "parent" | "child" | "sibling" | "spouse";

export interface RegistrationFormData {
  walletAddress: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  motherName: string;
  fatherName: string;
  email: string;
  did: string;
  didProof: string;
  didType: string;
  familyRole: FamilyRole;
  gender: string;
  privacySettings: {
    publicTree: boolean;
    shareData: boolean;
  };
}

export interface FormErrors {
  [key: string]: string;
}

export enum RegistrationStep {
  CONNECT_WALLET,
  MULTI_STEP_REGISTER,
}

// Initial form data
const initialFormData: RegistrationFormData = {
  walletAddress: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  motherName: "",
  fatherName: "",
  email: "",
  did: "",
  didProof: "",
  didType: "ION",
  familyRole: "parent",
  gender: "other",
  privacySettings: {
    publicTree: false,
    shareData: false,
  },
};

// Create atoms
export const registrationFormAtom = atomWithStorage<RegistrationFormData>(
  "registration-form",
  initialFormData
);
export const registrationErrorsAtom = atom<FormErrors>({});
export const registrationStepAtom = atom<RegistrationStep>(
  RegistrationStep.CONNECT_WALLET
);
export const registrationLoadingAtom = atom<boolean>(false);
export const datePickerAtom = atom<Date | undefined>(undefined);
export const isGeneratingDidAtom = atom<boolean>(false);
export const showDiagnosticsAtom = atom<boolean>(false);

// Derived atom that updates wallet address in form data when address changes
export const updateWalletAddressAtom = atom(
  null,
  (get, set, address: string) => {
    set(registrationFormAtom, {
      ...get(registrationFormAtom),
      walletAddress: address,
    });
    set(registrationStepAtom, RegistrationStep.MULTI_STEP_REGISTER);
  }
);

// Helper atom to update entire form data
export const updateFormDataAtom = atom(
  null,
  (get, set, newData: Partial<RegistrationFormData>) => {
    set(registrationFormAtom, {
      ...get(registrationFormAtom),
      ...newData,
    });
  }
);

// Helper atom to validate a specific field
export const validateFieldAtom = atom(
  null,
  (
    get,
    set,
    field: keyof RegistrationFormData,
    validatorFn: (
      value: RegistrationFormData[keyof RegistrationFormData]
    ) => string | null
  ) => {
    const formData = get(registrationFormAtom);
    const value = formData[field];
    const errorMessage = validatorFn(value);

    if (errorMessage) {
      set(registrationErrorsAtom, {
        ...get(registrationErrorsAtom),
        [field]: errorMessage,
      });
      return false;
    } else {
      // Clear error if valid
      const errors = { ...get(registrationErrorsAtom) };
      delete errors[field];
      set(registrationErrorsAtom, errors);
      return true;
    }
  }
);

// Helper atom to clear an error for a specific field
export const clearErrorAtom = atom(null, (get, set, field: string) => {
  const errors = { ...get(registrationErrorsAtom) };
  delete errors[field];
  set(registrationErrorsAtom, errors);
});
