import { twMerge } from "tailwind-merge";

type NativeButtonProps = JSX.IntrinsicElements["button"];

interface ActionButtonProps extends NativeButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

function ActionButton({
  variant = "primary",
  children,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        "flex-1 text-xl font-sans font-medium transition rounded-full py-2 px-3",
        variant === "secondary"
          ? "bg-neutral-800 hover:bg-neutral-700"
          : "bg-sky-900 hover:bg-sky-800",
        className
      )}
    >
      {children}
    </button>
  );
}

export default ActionButton;
