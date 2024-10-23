import { twMerge } from "tailwind-merge";

type NativeButtonProps = JSX.IntrinsicElements["button"];

interface ActionButtonProps extends NativeButtonProps {
  children?: React.ReactNode;
  className?: string;
}

function ActionButton({ children, className, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "flex-1 text-xl font-sans font-medium bg-sky-900 hover:bg-sky-800 transition rounded-full py-2 px-3",
        className
      )}
    >
      {children}
    </button>
  );
}

export default ActionButton;
