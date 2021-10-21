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

const { React, FluxDispatcher, getModule, getModuleByDisplayName, constants, i18n: { Messages } } = require('powercord/webpack');
const { Icon, Menu } = require('powercord/components');

const { getId: getCurrentUserId } = getModule([ 'initialize', 'getFingerprint' ], false);
const { openUserProfileModal } = getModule([ 'openUserProfileModal' ], false);
const { getDefaultAvatarURL } = getModule([ 'getDefaultAvatarURL' ], false);
const { default: Avatar } = getModule([ 'AnimatedAvatar' ], false);
const { updateNote } = getModule([ 'updateNote' ], false);
const { getUser } = getModule([ 'fetchProfile' ], false);

const List = getModule([ 'ListNavigatorProvider' ], false);
const Serializer = getModule([ 'serialize', 'deserialize' ], false);
const ActionButton = getModuleByDisplayName('ActionButton', false);
const Popout = getModuleByDisplayName('Popout', false);

const SlateTextArea = require('./SlateTextArea');

function renderHeader (props, states) {
  return (
    <header className='notey-note-browser-user-card-header'>
      <Avatar src={states.user?.getAvatarURL() || getDefaultAvatarURL(props.userId)} size='SIZE_32' onClick={() => openUserProfileModal({ userId: props.userId })} />
      <div className='notey-note-browser-user-card-username'>
        {states.user?.tag || Messages.UNKNOWN_USER}
        {props.userId === getCurrentUserId() && <div className='notey-note-browser-user-self-tag'>&nbsp;You</div>}
      </div>
      <div className='notey-note-browser-user-card-actions'>
        <ActionButton
          onClick={() => states.setEditing(true)}
          shouldHighlight={states.editing}
          tooltip={Messages.EDIT_NOTE}
          icon={(props) => <Icon name='Pencil' {...props} />}
        />
        <Popout
          renderPopout={(popoutProps) => <Menu.Menu
            navId='notey-user-note-card-context-menu'
            onClose={popoutProps.closePopout}
            onSelect={void 0}
            aria-label={Messages.NOTEY_NOTE_ACTIONS_MENU_LABEL}
          >
            <Menu.MenuItem id='copy-note' label={Messages.NOTEY_COPY_NOTE} action={() => window.DiscordNative.clipboard.copy(states.textValue)} />
            <Menu.MenuItem id='remove-note' label={Messages.NOTEY_REMOVE_NOTE} color='colorDanger' action={() => updateNote(props.userId, '')} />
            <Menu.MenuSeparator />
            <Menu.MenuItem id='view-profile' label={Messages.VIEW_PROFILE} action={() => openUserProfileModal({ userId: props.userId })} />
          </Menu.Menu>}
        >
          {(popoutProps) => <ActionButton
            {...popoutProps}
            tooltip={Messages.MORE}
            icon={(props) => <Icon name='OverflowMenu' {...props} />}
          />}
        </Popout>
      </div>
    </header>
  );
}

function renderBody (props, states) {
  return (
    <div className='notey-note-browser-user-card-body'>
      <div className='notey-note-browser-user-card-body-inner notey-markdown-textarea'>
        <SlateTextArea
          rows={6}
          maxLength={constants.NOTE_MAX_LENGTH}
          ref={props.editorRef}
          spellcheckEnabled={false}
          disableAutoFocus={true}
          disabled={!states.editing}
          onBlur={() => {
            states.setEditing(false);

            props.note !== states.textValue && updateNote(states.user.id, states.textValue);
          }}
          onChange={(_, textValue, richValue) => (states.setTextValue(textValue), states.setRichValue(richValue))}
          placeholder='Oh, hey! What shall it be?'
          value={states.richValue}
          type='note'
        />
      </div>
    </div>
  );
}

module.exports = (props) => {
  const [ user, setUser ] = React.useState(props.user);
  const [ editing, setEditing ] = React.useState(false);
  const [ textValue, setTextValue ] = React.useState(props.note);
  const [ richValue, setRichValue ] = React.useState(Serializer.deserialize(props.note));

  const handleActionButton = React.useCallback(() => setEditing(!editing), [ editing ]);
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    if (editing) {
      editorRef?.current?.withEditor(editorRef => {
        editorRef.focus();
        editorRef.moveFocusToEndOfDocument();
      });
    }

    return () => editorRef?.current?.withEditor(editorRef => editorRef.blur());
  }, [ editing ]);

  React.useEffect(async () => {
    if (!user) {
      const user = await FluxDispatcher.wait(() => getUser(props.userId));

      setUser(user);
    }
  }, [ user ]);

  const states = {
    user,
    editing,
    setEditing,
    textValue,
    setTextValue,
    richValue,
    setRichValue
  };

  return (
    <List.ListNavigatorItem id={props.userId}>
      {(listItemProps) => <div className='notey-note-browser-user-card' {...listItemProps}>
        {renderHeader({ ...props, handleActionButton }, states)}
        {renderBody({ ...props, editorRef }, states)}
      </div>}
    </List.ListNavigatorItem>
  );
};
