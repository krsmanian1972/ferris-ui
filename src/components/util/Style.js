import React from "react";
import { Typography} from 'antd';

const { Title } = Typography

export const pageHeaderStyle = {
    paddingTop: 0,
    paddingLeft: 5,
    paddingRight: 5,
};

export const cardHeaderStyle = {
    background: "#fafafa",
    borderBottom: "1px solid",
    borderColor: "rgb(216,213,221)",
    borderRadius: "12px 12px 0px 0px"
};

export const headerMenuStyle = {
    background: "#f5f5f5",
    color: "rgb(69,49,28)",
    borderBottom: "1px solid",
    borderColor: "rgb(216,213,221)",
};

export const rustColor = {
    color: "rgb(69,49,28)",
    fontWeight: "bold"
}

export function pageTitle(title) {
    return <Title style={rustColor} level={3}>{title}</Title>
}

