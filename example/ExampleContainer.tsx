import * as React from 'react';

import {FieldSelector, SchemaData} from "../dist";
import {Paper} from "@material-ui/core";

const schemaData = [
    {
        name: "apple",
        dataType: "string",
        required: false
    },
    {
        name: "banana",
        dataType: 'integer',
        required: true,
        children: [
            {
                name: "name",
                dataType: 'integer',
                required: true,
            },
            {
                name: "age",
                dataType: 'boolean',
                required: false,
                children: [
                    {
                        name: "username",
                        dataType: 'object',
                        required: true
                    },
                    {
                        name: "password",
                        dataType: 'array',
                        required: true
                    }
                ]
            }
        ]
    }
] as SchemaData;


const pathToString = (s) => "$." + s.join(".");
export default class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            path: [],
            schemaData: schemaData
        };
    }

    handleSelect = (path: string[]) => {
        this.setState({path});
        console.log('>>> FieldSelector.onSelect.path', path);
    };

    handleInputChange = (e: any) => {
        this.setState({schemaData: JSON.parse(e.target.value)})
    };

    render() {
        const {path, schemaData} = this.state;
        return (
            <div style={{height: "100vh", width: "100vw", display: "flex"}}>
                <Paper style={{width: 300}}>
                    <FieldSelector
                        schema={schemaData}
                        onSelect={this.handleSelect}
                    />
                </Paper>
                <div style={{display: "flex", flexDirection: "column"}} className="fit-parent">
                    {pathToString(path)}
                    <textarea style={{flexGrow: 1}} onChange={this.handleInputChange} value={JSON.stringify(schemaData, null, 4)}/>
                </div>
            </div>
        );
    }
}

