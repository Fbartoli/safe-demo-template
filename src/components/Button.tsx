import { LoadingSpinner } from "./LoadingSpinner";

export const Button = ({
  buttonText,
  onClick,
  isLoading,
  disabled,
}: {
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="secondary-button"
    >
      {isLoading ? <LoadingSpinner /> : buttonText}
    </button>
  );
};