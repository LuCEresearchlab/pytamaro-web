/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */

export default function ValueCard({ value }: { value: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "15em",
        height: "4em",
        backgroundColor: "white",
        border: "1px solid black",
      }}
    >
      <h1>{value}</h1>
    </div>
  );
}
