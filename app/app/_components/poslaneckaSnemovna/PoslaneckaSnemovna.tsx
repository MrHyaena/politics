import React from "react";
import poslanci from "../../_data/poslanci.json";

type Props = {};

export default function PoslaneckaSnemovna({}: Props) {
  const sortedPoslanci = Object.groupBy(poslanci.poslanci, (poslanec) =>
    poslanec.klub ? poslanec.klub : "Nezávislý"
  );

  console.log(sortedPoslanci);
  return (
    <div className="flex gap-5 flex-wrap">
      {" "}
      {poslanci.poslanci.map((poslanec: { name: string }) => {
        const names = poslanec.name.split(/\s+/);
        console.log(names);
        return (
          <div
            key={poslanec.name}
            className="p-2 bg-amber-700 text-white rounded-md w-10 h-10 flex items-center justify-center"
          >
            {names[0][0] + names[1][0]}
          </div>
        );
      })}
    </div>
  );
}
