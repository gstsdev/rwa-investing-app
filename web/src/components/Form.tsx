import React, { FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

type NativeFieldsetProps = JSX.IntrinsicElements["fieldset"];
type NativeLabelProps = JSX.IntrinsicElements["label"];
type NativeInputProps = JSX.IntrinsicElements["input"];

interface FormGroupProps extends NativeFieldsetProps {}

const FormGroup: FunctionComponent<FormGroupProps> = ({
  className,
  ...props
}) => {
  return (
    <fieldset
      {...props}
      className={twMerge("font-sans flex flex-col pb-3", className)}
    />
  );
};

interface FormLabelProps extends NativeLabelProps {}

const FormLabel: FunctionComponent<FormLabelProps> = ({
  className,
  ...props
}) => {
  return (
    <label {...props} className={twMerge("font-sans text-lg", className)} />
  );
};

interface FormInputProps extends NativeInputProps {}

const FormInput: FunctionComponent<FormInputProps> = ({
  className,
  ...props
}) => {
  return (
    <input
      {...props}
      className={twMerge(
        "font-sans p-2 text-lg bg-neutral-900 placeholder:text-neutral-600 rounded",
        className
      )}
    />
  );
};

const Form = {
  Group: FormGroup,
  Label: FormLabel,
  Input: FormInput,
};

export default Form;
