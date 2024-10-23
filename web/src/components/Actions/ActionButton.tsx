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
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      aria-disabled={disabled}
      className={twMerge(
        "flex-1 text-xl font-sans font-medium transition rounded-full py-2 px-3 aria-disabled:cursor-default aria-disabled:opacity-60",
        variant === "secondary" ? "bg-neutral-800" : "bg-sky-900",
        !disabled &&
          (variant === "secondary"
            ? "hover:bg-neutral-700"
            : "hover:bg-sky-800"),
        className
      )}
      onClick={(ev) => !disabled && props.onClick?.(ev)}
    >
      {children}
    </button>
  );
}

export default ActionButton;
