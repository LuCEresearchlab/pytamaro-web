function Card({ ArrowComponent }) {
  return (
    <div>
      <ArrowComponent prop1="1" />
    </div>
  );
}

export function BasicCard() {
  const langs = ["rectangle", "rechteck", "rettangolo"];
  const totalHeight = "300px";
  const totalWidth = "150px";
  const inputFields = 4;
  const outputFields = 1;

  return (
    <div>
      <h1 style={{ marginLeft: "10px" }}>Basic Card</h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "right",
            justifyContent: "space-evenly",
          }}
        >
          {/* arrows to the left of the card */}
          {Array.from({ length: inputFields }).map((_, index) => (
            <svg
              key={index}
              width="46"
              height="35"
              viewBox="0 0 26 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 3L21 0.113249V5.88675L26 3ZM0 3.5L21.5 3.5V2.5L0 2.5L0 3.5Z"
                fill="black"
              />
            </svg>
          ))}
        </div>
        <div
          style={{
            width: totalWidth,
            height: totalHeight,
            border: "5px solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* PyTamaro svg symbol */}
          <svg
            width="40"
            height="20"
            viewBox="0 0 121 87"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginTop: "5px" }}
          >
            <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#7F99EF" />
            <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#7F99EF" />
            <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#6589FF" />
            <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#7F99EF" />
            <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#7F99EF" />
            <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#6589FF" />
            <path d="M60.5 0L98.1721 65.25H22.8279L60.5 0Z" fill="#F84545" />
          </svg>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
              height: "50%",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            {/* Maps list of languages to card */}
            {langs.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: "2px 0",
                }}
              >
                {lang}
              </p>
            ))}
          </div>
          {/* Rectangle svg at the bottom of the card */}
          <svg
            width="90"
            height="70"
            viewBox="0 0 41 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ alignSelf: "left" }}
          >
            <rect x="7" y="7" width="34" height="21" fill="#55CC75" />
            <path
              d="M7 3L12 5.88675V0.113249L7 3ZM41 3L36 0.113249V5.88675L41 3ZM11.5 3.5L36.5 3.5V2.5L11.5 2.5V3.5Z"
              fill="black"
            />
            <path
              d="M3 28L5.88675 23L0.113249 23L3 28ZM3 7L0.113249 12L5.88675 12L3 7ZM3.5 23.5L3.5 11.5L2.5 11.5L2.5 23.5L3.5 23.5Z"
              fill="black"
            />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Output arrows to the right of the card */}
          {Array.from({ length: outputFields }).map((_, index) => (
            <svg
              key={index}
              width="46"
              height="35"
              viewBox="0 0 26 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 3L21 0.113249V5.88675L26 3ZM0 3.5L21.5 3.5V2.5L0 2.5L0 3.5Z"
                fill="black"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Giovanni() {
  return (
    <div>
      <BasicCard />
    </div>
  );
}
