import React, { useState, useRef } from 'react';
import { Tree, Input, Select } from 'antd';
import { TreeProps, AntTreeNodeProps } from 'antd/es/tree';

import styles from './index.module.less';

export interface TreeSelectProps extends TreeProps {
  value?: string;
  placeholder?: string;
  selectable?: boolean;
  filterPlaceholder?: string;
  onlySelectLeaf?: boolean;
  onChange?: (value: string) => void;
}
const InputGroup = Input.Group;

/**
 * 递归筛选路径和路由的
 * @param data
 * @param keyWord
 */
const filterTreeData = (data: TreeProps['treeData'], keyWord: string) => {
  if (!keyWord) {
    return data || [];
  }

  if (data) {
    return data
      .filter(item => item.key.includes(keyWord))
      .map(item => ({
        ...item,
        children: filterTreeData(item.children, keyWord),
      }));
  }
  return [];
};

const TreeSelect: React.FC<TreeSelectProps> = props => {
  const {
    value = '',
    placeholder,
    onChange: propOnChange,
    onlySelectLeaf,
    filterPlaceholder,
  } = props;
  const ref = useRef();
  const [open, setOpen] = useState<boolean>(false);

  const [keyWord, setKeyWord] = useState<string>('');

  const onChange = (path: string, fileName: string) => {
    propOnChange(`${path}/${fileName}`.replace(/\/\//g, '/'));
  };
  const fileArray = value.split('/');

  const name = fileArray.pop();
  const filePath = fileArray.join('/') || '/';
  const selectDom = (
    <Select
      style={{ width: onlySelectLeaf ? '100%' : '50%' }}
      getPopupContainer={() => ref.current || document.body}
      value={onlySelectLeaf ? value : filePath}
      onDropdownVisibleChange={setOpen}
      placeholder={placeholder}
      open={open}
      dropdownRender={() => (
        <div
          style={{
            backgroundColor: '#23232e',
          }}
        >
          <div
            style={{
              padding: 8,
            }}
          >
            <Input
              className={styles.filterInput}
              value={keyWord}
              onChange={e => {
                setKeyWord(e.target.value);
              }}
              placeholder={filterPlaceholder}
            />
          </div>
          <Tree
            blockNode
            className={styles.tree}
            onClick={() => setOpen(false)}
            selectedKeys={filePath ? [filePath] : []}
            onSelect={(_, { node }: { node: AntTreeNodeProps }) => {
              if (onlySelectLeaf && node.children && (node.children as any[]).length > 0) {
                return;
              }
              if (onlySelectLeaf) {
                propOnChange(node.value);
                return;
              }
              if (onChange) {
                onChange(node.value, name);
              }
            }}
            {...props}
            treeData={filterTreeData(props.treeData || [], keyWord)}
          />
        </div>
      )}
    />
  );
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
      }}
    >
      {onlySelectLeaf ? (
        selectDom
      ) : (
        <InputGroup compact>
          {selectDom}
          <Input
            style={{ width: '50%' }}
            value={name}
            onChange={e => {
              onChange(filePath, e.target.value);
            }}
          />
        </InputGroup>
      )}
    </div>
  );
};

export default TreeSelect;
