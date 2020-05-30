import { Select } from 'antd';
import React from 'react';
import { observer } from "mobx-react"

const { Option } = Select;

const CustomSelect = observer(({
    options,
    onSelectCallBack,
    defaultValue,
    size,
    disabled
}) => (
        <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select an option"
            optionFilterProp="children"
            size={size}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={(value) => { onSelectCallBack(value) }}
            filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            {options.map(element =>
                <Option key={element.userId} value={element.userId}>{element.fullName}</Option>
            )}
        </Select>
    )
)
export default CustomSelect;