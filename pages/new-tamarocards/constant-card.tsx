/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import PyTamaroSymbol from "./PyTamaro-symbol";

export default function ConstantCard() {
  return (
    <div
      style={{
        position: "relative",
        width: "12.5em",
        height: "12.5em",
        backgroundColor: "#E6F5FD",
        border: "0.4em solid #118BCA",
        borderRadius: "0.4em",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        color: "black",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0.5em",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <PyTamaroSymbol />
      </div>
      <span
        style={{
          fontSize: "1.5em",
          zIndex: 1,
        }}
      >
        Constant Card
      </span>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-1.35em",
          width: "2.25em",
          height: "2.25em",
          backgroundColor: "#E6F5FD",
          borderTop: "0.4em solid #118BCA",
          borderRight: "0.4em solid #118BCA",
          transform: "translateY(-50%) rotate(45deg)",
        }}
      />
    </div>
  );
}
