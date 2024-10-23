import React, { FunctionComponent, useMemo, useState } from "react";
import ActionButton from "./ActionButton";
import Form from "../Form";

interface DepositFormProps {
  sourceToken: { symbol: string; decimals: number };
  destToken: { symbol: string; decimals: number };
  exchangeRate: number;
}

const DepositForm: FunctionComponent<DepositFormProps> = ({
  sourceToken,
  destToken,
  exchangeRate,
}) => {
  const [sourceTokenAmount, _setSourceTokenAmount] = useState<string>("1");
  const [destTokenAmount, _setDestTokenAmount] = useState<number>(
    () => +sourceTokenAmount * exchangeRate
  );
  const valueStep = useMemo(() => {
    let decimalPlaces = `${sourceTokenAmount}`.split(".")[1]?.length ?? 0;

    return 1 / 10 ** decimalPlaces;
  }, [sourceTokenAmount]);

  function setSourceTokenAmount(amount: any) {
    let value = _normalizeAmount(amount, sourceToken.decimals);

    _setSourceTokenAmount(value);
    _setDestTokenAmount(+value * exchangeRate);
  }

  function setDestTokenAmount(amount: any) {
    let value = _normalizeAmount(amount, destToken.decimals);

    _setDestTokenAmount(+value);
    _setSourceTokenAmount(`${+value / exchangeRate}`);
  }

  return (
    <form className="w-full flex flex-col bg-black-100 p-2 rounded-lg">
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

      <ActionButton variant="secondary" type="submit" className="w-full mt-2">
        Deposit
      </ActionButton>
    </form>
  );
};

export default DepositForm;

function _normalizeAmount(amount: any, decimals: number) {
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
