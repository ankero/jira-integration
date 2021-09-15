import React from "react";
import { FilterMenu } from "@happeouikit/menus";
import { IconFilter } from "@happeouikit/icons";
import { AVAILABLE_COLUMNS } from "../constants";

const ColumnsFilter = ({ onChangeFilter, selectedColumns }) => {
  return (
    <Wrapper>
      <FilterMenu
        actions={AVAILABLE_COLUMNS.map((item) => ({
          ...item,
          name: item.label,
          type: item.field,
          callback: onChangeFilter,
        }))}
        icon={IconFilter}
        selected={selectedColumns}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  // Fix selected indicator width
  > div > span {
    width: auto;
  }
`;

export default ColumnsFilter;
