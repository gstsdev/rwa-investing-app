import React, { FunctionComponent, useMemo, useState } from "react";
import ActionButton from "./ActionButton";
import Form from "../Form";
import { ArrowLeftIcon } from "lucide-react";

interface ExchangeFormProps {
  sourceToken: { symbol: string; decimals: number };
  destToken: { symbol: string; decimals: number };
  exchangeRate: number;
  exchangingLabel?: string;
  buttonLabel?: string;
  isExchanging: boolean;
  onExchange(value: string): unknown;
  onClose(): unknown;
}

const ExchangeForm: FunctionComponent<ExchangeFormProps> = ({
  sourceToken,
  destToken,
  exchangeRate,
  exchangingLabel = "Exchanging...",
  buttonLabel = "Exchange",
  isExchanging,
  onExchange,
  onClose,
}) => {
  const [sourceTokenAmount, _setSourceTokenAmount] = useState<string>("1");
  const [destTokenAmount, _setDestTokenAmount] = useState<number>(
    () => +sourceTokenAmount * exchangeRate
  );
  const valueStep = useMemo(() => {
    const decimalPlaces = `${sourceTokenAmount}`.split(".")[1]?.length ?? 0;

    return 1 / 10 ** decimalPlaces;
  }, [sourceTokenAmount]);

  function setSourceTokenAmount(amount: unknown) {
    const value = _normalizeAmount(amount, sourceToken.decimals);

    _setSourceTokenAmount(value);
    _setDestTokenAmount(+value * exchangeRate);
  }

  function setDestTokenAmount(amount: unknown) {
    const value = _normalizeAmount(amount, destToken.decimals);

    _setDestTokenAmount(+value);
    _setSourceTokenAmount(`${+value / exchangeRate}`);
  }

  function handleFormSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    onExchange(sourceTokenAmount);
  }

  return (
    <div className="w-full flex flex-col bg-black-100 p-2 rounded-lg">
      <div className="flex mb-2">
        <button
          className="text-neutral-400 inline-flex items-center gap-1.5 text-sm"
          onClick={onClose}
        >
          <ArrowLeftIcon color="currentColor" className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </div>

      <form onSubmit={handleFormSubmit}>
        <Form.Group>
          <Form.Label htmlFor="sourceValue">{sourceToken.symbol}</Form.Label>

          <Form.Input
            type="number"
            min={0}
            step={valueStep}
            id="sourceValue"
            placeholder="1"
            value={sourceTokenAmount}
            onChange={(e) => setSourceTokenAmount(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="destValue">{destToken.symbol}</Form.Label>

          <Form.Input
            type="number"
            min={0}
            step={valueStep}
            id="destValue"
            placeholder="0"
            value={destTokenAmount}
            onChange={(e) => setDestTokenAmount(e.target.value)}
          />
        </Form.Group>

        <ActionButton
          variant="secondary"
          type="submit"
          className="w-full mt-2"
          disabled={isExchanging}
        >
          {isExchanging ? exchangingLabel : buttonLabel}
        </ActionButton>
      </form>
    </div>
  );
};

export default ExchangeForm;

function _normalizeAmount(amount: unknown, decimals: number) {
  let value = `${amount || "0"}`;

  if (value.match(/^\d+$/)) {
    return value.startsWith("0") ? `${parseInt(value)}` : value;
  }

  if (value.match(/^\d+\.\d+e[+-]\d+$/)) {
    return value;
  }

  const [integer, floating] = value.split(".");

  value = [`${parseInt(integer)}`, (floating || "").slice(0, decimals)]
    .filter(Boolean)
    .join(".");

  return value;
}
