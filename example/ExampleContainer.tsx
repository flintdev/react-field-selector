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
            path: []
        };
    }

    handleSelect = (path: string[]) => {
        this.setState({path});
        console.log('>>> FieldSelector.onSelect.path', path);
    };

    render() {
        const {path} = this.state;
        return (
            <div className="fit-parent" style={{display: "flex"}}>
                <Paper style={{height: "100vh"}}>
                    <FieldSelector
                        schema={schemaData}
                        onSelect={this.handleSelect}
                    />
                </Paper>
                {pathToString(path)}
            </div>
        );
    }
}

