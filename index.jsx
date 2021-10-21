/**
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this plugin in the file LICENSE.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade the plugin to
 * newer versions in the future. If you wish to customize the plugin for
 * your needs, please document your changes and make backups before you update.
 *
 *
 * @copyright Copyright (c) 2020-2021 GriefMoDz
 * @license   OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @link      https://github.com/GriefMoDz/notey
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { Plugin } = require('powercord/entities');
const { React, Flux, FluxDispatcher, getModule, getModuleByDisplayName, http, constants: { Endpoints } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, getOwnerInstance } = require('powercord/util');

const NoteBrowserIcon = require('./components/icons/NoteBrowser');
const SlateTextArea = require('./components/misc/SlateTextArea');
// const Settings = require('./components/settings/Settings');
const NoteIcon = require('./components/icons/Note');
const i18n = require('./i18n');

const NotesStore = require('./lib/Store');
const cache = {};

const Serializer = getModule([ 'serialize', 'deserialize' ], false);
const { updateNote } = getModule([ 'updateNote' ], false);

module.exports = class Notey extends Plugin {
  get notesStore () {
    return NotesStore;
  }

  async startPlugin () {
    this.loadStylesheet('style.css');

    powercord.api.i18n.loadAllStrings(i18n);
    // powercord.api.settings.registerSettings(this.entityID, {
    //   category: 'notey',
    //   label: 'Notey',
    //   render: (props) => <Settings {...props} main={this} />
    // });

    http.get(Endpoints.NOTES).then(res => FluxDispatcher.dirtyDispatch({
      type: 'NOTEY_LOADED_NOTES',
      notes: res.body
    }));

    this.populateNoteIcon();
    this.patchNoteComponent();
    this.patchSettingsPage();
    this.patchToolbar();
  }

  patchNoteComponent () {
    const Note = this.fetchNoteComponent();
    this.inject('notey-notes-markdown', Note.prototype, 'render', function (_, res) {
      if (this.props.loading) {
        return res;
      }

      const textAreaProps = res.props.children.props;

      res.props.className += ' notey-markdown-textarea';
      res.props.children = <SlateTextArea
        rows={6}
        maxLength={textAreaProps.maxLength}
        spellcheckEnabled={textAreaProps.autoCorrect}
        disableAutoFocus={textAreaProps.autoFocus}
        className={textAreaProps.className}
        disabled={textAreaProps.disabled}
        onBlur={() => this.props.note !== this.state.textValue && updateNote(this.props.userId, this.state.textValue)}
        onChange={(_, textValue, richValue) => this.setState({
          textValue,
          richValue
        })}
        placeholder={textAreaProps.placeholder}
        value={this.state?.richValue || Serializer.deserialize(textAreaProps.defaultValue || '')}
        type='note'
      />;

      return res;
    });
  }

  async patchSettingsPage() {
    const ErrorBoundary = require('../pc-settings/components/ErrorBoundary')

    const FormSection = getModuleByDisplayName('FormSection', false)
    const SettingsView = await getModuleByDisplayName('SettingsView')
    this.inject('notey-settings-page', SettingsView.prototype, 'getPredicateSections', (_, sections) => {
      const changelog = sections.find(category => category.section === 'changelog');
      if (changelog) {
        const SettingsPage = sections.find(category => category.section === this.entityID);
        if (SettingsPage) {
          const SettingsElement = powercord.api.settings.tabs[this.entityID].render;

          SettingsPage.element = () => (
            <ErrorBoundary>
              <FormSection title={this.manifest.name} tag='h1'>
                <SettingsElement />
              </FormSection>
            </ErrorBoundary>
          );
        }
      }

      return sections;
    });
  }

  populateNoteIcon () {
    const ConnectedNoteIcon = Flux.connectStores([ NotesStore, powercord.api.settings.store ], (props) => ({
      hasNote: props.user?.id ? NotesStore.getNotes()[props.user.id] : false,
      ...powercord.api.settings._fluxProps('notey')
    }))(NoteIcon);

    const getDefaultMethodByKeyword = (mdl, keyword) => {
      const defaultMethod = mdl.__powercordOriginal_default ?? mdl.default;
      return typeof defaultMethod === 'function' ? defaultMethod.toString().includes(keyword) : null;
    };

    const MessageHeader = getModule(m => getDefaultMethodByKeyword(m, 'showTimestampOnHover'), false);
    this.inject('notey-message-header-icon-1', MessageHeader, 'default', ([ { message: { author: user } } ], res) => {
      const defaultProps = { user, location: 'message-headers' };
      const usernameHeader = findInReactTree(res, n => Array.isArray(n?.props?.children) && n.props.children.find(c => c?.props?.message));

      if (usernameHeader?.props?.children && usernameHeader?.props?.children[0] && usernameHeader?.props?.children[0].props) {
        usernameHeader.props.children[0].props.__noteyDefaultProps = defaultProps;
      }

      return res;
    });

    const UsernameHeader = getModule(m => getDefaultMethodByKeyword(m, 'withMentionPrefix'), false);
    this.inject('notey-message-header-icon-2', UsernameHeader, 'default', ([ { __noteyDefaultProps: defaultProps } ], res) => {
      res.props.children.splice(2, 0, [
        <ConnectedNoteIcon {...defaultProps} />
      ]);

      return res;
    });

    [ 'ChannelMessage', 'InboxMessage' ].forEach(component => {
      const mdl = getModule(m => m.type?.displayName === component, false);
      if (mdl) {
        this.inject(`notey-message-header-fix-${component}`, mdl, 'type', (_, res) => {
          if (res.props.childrenHeader) {
            res.props.childrenHeader.type.type = MessageHeader.default;
          }

          return res;
        });

        mdl.type.displayName = component;
      }
    });

    const MemberListItem = getModuleByDisplayName('MemberListItem', false);
    this.inject('notey-member-list-icon', MemberListItem.prototype, 'renderDecorators', function (_, res) {
      const { user } = this.props;
      const defaultProps = { user, location: 'members-list' };

      res.props.children.unshift([
        <ConnectedNoteIcon {...defaultProps} />
      ]);

      return res;
    });

    const DiscordTag = getModule(m => m.default?.displayName === 'DiscordTag', false);
    this.inject('notey-name-tag-icon-1', DiscordTag, 'default', ([ { user } ], res) => {
      res.props.user = user;

      return res;
    });

    DiscordTag.default.displayName = 'DiscordTag';

    const userStore = getModule([ 'getCurrentUser' ], false);
    const NameTag = getModule(m => m.default?.displayName === 'NameTag', false);
    this.inject('notey-name-tag-icon-2', NameTag, 'default', ([ props ], res) => {
      const user = props.user || userStore.findByTag(props.name, props.discriminator);
      const defaultProps = { user, location: 'user-popout-modal' };

      res.props.children.splice(2, 0, [
        <ConnectedNoteIcon {...defaultProps} />
      ]);

      return res;
    });

    NameTag.default.displayName = 'NameTag';

    const PrivateChannel = getModuleByDisplayName('PrivateChannel', false);
    this.inject('notey-dm-channel-icon', PrivateChannel.prototype, 'render', function (_, res) {
      if (!this.props.user) {
        return res;
      }

      const { user } = this.props;
      const defaultProps = { user, location: 'direct-messages' };
      const decorators = Array.isArray(res.props.decorators) ? res.props.decorators : [ res.props.decorators ];

      res.props.decorators = [
        ...decorators,
        <ConnectedNoteIcon {...defaultProps} />
      ];

      return res;
    });
  }

  patchToolbar () {
    const HeaderBarContainer = getModuleByDisplayName('HeaderBarContainer', false);

    this.inject('notey-header-bar', HeaderBarContainer.prototype, 'render', (_, res) => {
      const toolbar = res.props.toolbar;

      if (toolbar) {
        const children = toolbar.props.children;
        const index = children?.findIndex(i => i?.type?.displayName === 'RecentsButton');

        if (index > -1) {
          children.splice(index, 0, <NoteBrowserIcon />);
        }
      }

      return res;
    });

    const classes = getModule([ 'title', 'chatContent' ], false);
    const toolbar = document.querySelector(`.${classes.title}`);

    if (toolbar) {
      getOwnerInstance(toolbar)?.forceUpdate?.();
    }
 }

  pluginWillUnload () {
    cache.injections?.forEach(id => uninject(id));

    powercord.api.settings.unregisterSettings(this.entityID);
  }

  inject (id, ...args) {
    if (!cache.injections) {
      cache.injections = [];
    }

    cache.injections.push(id);

    return inject(id, ...args);
  }

  fetchNoteComponent () {
    const ConnectedNote = getModuleByDisplayName('ConnectedNote', false);

    const Internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
    const useMemo = Internals.useMemo;
    const useState = Internals.useState;
    const useCallback = Internals.useCallback;
    const useContext = Internals.useContext;
    const useEffect = Internals.useEffect;
    const useLayoutEffect = Internals.useLayoutEffect;
    const useRef = Internals.useRef;
    const useReducer = Internals.useReducer;

    Internals.useMemo = (fn) => fn();
    Internals.useState = (value) => [ value, () => void 0 ];
    Internals.useCallback = (cb) => cb;
    Internals.useContext = (ctx) => ctx._currentValue;
    Internals.useEffect = () => null;
    Internals.useLayoutEffect = () => null;
    Internals.useRef = () => ({});
    Internals.useReducer = () => ({});

    const Note = new ConnectedNote({ userId: null }).type;

    Internals.useMemo = useMemo;
    Internals.useState = useState;
    Internals.useCallback = useCallback;
    Internals.useContext = useContext;
    Internals.useEffect = useEffect;
    Internals.useLayoutEffect = useLayoutEffect;
    Internals.useRef = useRef;
    Internals.useReducer = useReducer;

    return Note;
  }
}
