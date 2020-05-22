import * as React from "react";
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import InputBase from '@material-ui/core/InputBase';

export interface Field {
    name: string,
    dataType: 'string' | 'integer' | 'boolean' | 'object' | 'array',
    required: boolean,
    children?: Field[],
}

export type SchemaData = Field[];

export interface FieldSelectorProps extends React.ComponentProps<any> {
    schema: SchemaData
    onSelect: Function
}

const isSame = (a, b) => JSON.stringify(a) == JSON.stringify(b);
const deepCopy = (a) => JSON.parse(JSON.stringify(a));
const allStartIndex = (source, target) => {
    let ret: number[] = [];
    if (!target || target.length == 0) return ret;
    for (let i = 0; i < source.length; i++) {
        let k = i;
        for (let j = 0; j < target.length; j++) {
            if (source[k] !== target[j]) {
                break;
            } else {
                k += 1;
            }
            if (j === target.length - 1) {
                ret.push(i);
                i = k;
            }
        }
    }
    return ret;
};

const highlightWords = (indexList, word, highLightLength) => {
    const indexListSet = new Set(indexList);
    const ret: any[] = [];
    let cur = "";
    let keyIndex = 0;
    for (let i = 0; i < word.length; i++) {
        if (indexListSet.has(i)) {
            if (!!cur) ret.push(<span key={keyIndex++}>{cur}</span>);
            ret.push(<span key={keyIndex++}
                           style={{backgroundColor: "yellow"}}>{word.slice(i, i + highLightLength)}</span>);
            i += highLightLength - 1;
            cur = "";
        } else {
            cur += word[i];
        }
    }
    if (!!cur) ret.push(<span key={keyIndex++}>{cur}</span>);
    return <> {...ret} </>;
};

export class FieldSelector extends React.Component<FieldSelectorProps, any> {
    private searchedNode: string[];
    private nodeIdToPath: { [k: string]: string[] };

    constructor(props: any) {
        super(props);
        this.state = {
            expanded: [],
            selected: [],
            searchValue: "",
            isSearching: false
        };
        this.searchedNode = [];
        this.nodeIdToPath = {};
    };

    static nodeId = 0;
    getNodeId = () => (FieldSelector.nodeId++).toString();

    componentDidMount(): void {
        FieldSelector.nodeId = 0;
        const _isSame = isSame(this.searchedNode, this.state.expanded);
        if (this.state.isSearching && !_isSame) this.setState({expanded: this.searchedNode});
        this.searchedNode = [];
    }

    componentDidUpdate(): void {
        FieldSelector.nodeId = 0;
        const _isSame = isSame(this.searchedNode, this.state.expanded);
        if (this.state.isSearching && !_isSame) this.setState({expanded: this.searchedNode});
        this.searchedNode = [];
    }

    handleToggleDoubleClick = (event: any, nodeId: string) => {
        const expanded = this.state.expanded;
        const findIndex = expanded.indexOf(nodeId);
        if (findIndex !== -1) {
            expanded.splice(findIndex, 1);
        } else {
            expanded.push(nodeId);
        }
        this.setState({expanded: expanded, isSearching: false});
    };

    handleToggle = (event: any, nodeIds: string[]) => {
        this.setState({expanded: nodeIds, isSearching: false});
    };

    handleSelect = (event: any, nodeId: string) => {
        event.stopPropagation();
        event.preventDefault();
        this.props.onSelect(this.nodeIdToPath[nodeId]);
    };

    postOrder = (node: any) => {
        const {searchValue} = this.state;
        let startIndex = allStartIndex(node.name.toLowerCase(), searchValue.toLowerCase());
        let childContains = false;

        if (!node.children) {
            return {
                contains: startIndex.length > 0,
                startIndex: startIndex,
                value: node
            };
        } else {
            node.children = node.children.reduce((ret, child) => {
                const tmp = this.postOrder(child);
                const {contains} = tmp;
                childContains = childContains || contains;
                ret.push(tmp);
                return ret;
            }, []);
            return {
                contains: (startIndex.length > 0) || childContains,
                startIndex: startIndex,
                value: node
            };
        }
    };

    renderTreeItems = (schema, path = []) => {
        const {searchValue} = this.state;

        return schema.map(({contains, startIndex, value}, i) => {
            const nodeId = this.getNodeId();
            if (contains) this.searchedNode.push(nodeId);
            const {name, children, dataType, required} = value;
            let nameDisplay = name;
            if (startIndex.length > 0) {
                nameDisplay = highlightWords(startIndex, name, searchValue.length);
            }
            this.nodeIdToPath[nodeId] = path.concat(name);
            return (
                <TreeItem key={i} nodeId={nodeId} label={
                    (<div style={{display: "flex"}}
                          onClick={(e) => this.handleSelect(e, nodeId)}
                          onDoubleClick={(e) => this.handleToggleDoubleClick(e, nodeId)}
                    >
                        <div style={{flexGrow: 1, fontWeight: required ? "bold" : "unset", userSelect: "none"}}>
                            {nameDisplay}
                        </div>
                        <span style={{color: "lightgrey", paddingRight: 5}}>
                            {dataType}
                        </span>
                    </div>)
                }>
                    {!!children && this.renderTreeItems(children, path.concat(name))}
                </TreeItem>
            );
        });
    };

    handleSearchChange = (e: any) => {
        this.setState({searchValue: e.target.value, isSearching: true});
    };

    handleSearchRender = (schema: SchemaData) => {
        return this.renderTreeItems(
            schema.map(node => this.postOrder(deepCopy(node)))
        );
    };

    render() {
        const {schema} = this.props;
        const {searchValue, expanded} = this.state;

        return (
            <div style={{display: "flex", flexDirection: "column"}}>
                <InputBase
                    style={{width: "100%", padding: "0px 5px", borderBottom: "2px solid gray"}}
                    placeholder="search"
                    margin="dense"
                    inputProps={{'aria-label': 'search google maps'}}
                    value={searchValue}
                    onChange={this.handleSearchChange}
                />
                <TreeView
                    expanded={expanded}
                    defaultCollapseIcon={<ExpandMoreIcon/>}
                    defaultExpandIcon={<ChevronRightIcon/>}
                    onNodeToggle={this.handleToggle}
                >
                    {this.handleSearchRender(schema)}
                </TreeView>
            </div>
        );
    }
}
