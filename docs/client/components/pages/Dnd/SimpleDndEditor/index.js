import React, { Component } from 'react';
import { EditorState, Entity } from 'draft-js';

// Plugin-Editor
import Editor from 'draft-js-plugins-editor';
import createCleanupEmptyPlugin from 'draft-js-cleanup-empty-plugin';
import createEntityPropsPlugin from 'draft-js-entity-props-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createDndPlugin from 'draft-js-dnd-plugin';
import createToolbarPlugin from 'draft-js-toolbar-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import TextToolbar from 'draft-js-toolbar-plugin/components/text-toolbar';

// Components
import PlaceholderGithub from '../components/placeholder-github';
import BlockText from '../components/block-text';

// Utils
import addBlock from 'draft-js-dnd-plugin/modifiers/addBlock';
import mockUpload from '../utils/mockUpload';

import styles from './styles.css';

// Init Plugins
const plugins = [
  createCleanupEmptyPlugin({
    types: ['block-image', 'block-text'],
  }),
  createToolbarPlugin({}),
  createFocusPlugin({}),
  createImagePlugin({}),
  createEntityPropsPlugin({}),
  createDndPlugin({
    allowDrop: true,
    handleUpload: (data, success, failed, progress) =>
      mockUpload(data, success, failed, progress),
    handlePlaceholder: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return addBlock(state, state.getSelection(), 'block-image', data);
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return addBlock(state, state.getSelection(), 'placeholder-github', data);
      } return state;
    }, handleBlock: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return addBlock(state, state.getSelection(), 'block-image', data);
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return addBlock(state, state.getSelection(), 'block-text', data);
      } return state;
    },
  }),
];

class SimpleDndEditor extends Component {
  state = {
    editorState: EditorState.createEmpty(),
    draggingOver: false,
  };

  onChange = (editorState) => {
    // console.log(convertToRaw(editorState.getCurrentContent()));
    this.setState({ editorState });
  };

  focus = () => {
    this.refs.editor.focus();
  };

  blockRendererFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'placeholder-github') {
      return { component: PlaceholderGithub };
    } else if (type === 'block-text') {
      return { component: BlockText };
    } return undefined;
  }

  render() {
    const { editorState } = this.state;
    const { isDragging, progress } = this.props;
    const classNames = [styles.editor];
    if (isDragging) classNames.push(styles.dnd);
    if (progress) classNames.push(styles.uploading);

    return (
      <div className={classNames.join(' ')} onClick={this.focus}>
        <Editor editorState={editorState}
          onChange={this.onChange}
          blockRendererFn={this.blockRendererFn}
          plugins={plugins}
          ref="editor"
        />
      </div>
    );
  }
}

export default SimpleDndEditor;
