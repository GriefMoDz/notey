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

const { React, getAllModules, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Clickable, Icon, Spinner } = require('powercord/components');

const { AdvancedScrollerThin } = getModule([ 'AdvancedScrollerThin' ], false);

const classes = {
  ...getModule([ 'browser', 'icon' ], false),
  ...getModule([ 'title', 'searchIcon' ], false)
};

const Header = getModuleByDisplayName('Header', false);
const TabBar = getModuleByDisplayName('TabBar', false);
const SearchBar = getModuleByDisplayName('SearchBar', false);

const NotesStore = require('../../lib/Store');
const NoteBrowserEmptyState = require('./NoteBrowserEmptyState');
const UserNoteCard = require('./UserNoteCard');

const userStore = getModule([ 'getCurrentUser' ], false);
const guildStore = getModule([ 'getLastSelectedGuildId' ], false);
const relationshipStore = getModule([ 'getRelationships' ], false);
const useSubscribeGuildMembers = getModule([ 'useSubscribeGuildMembers' ], false).default;

const List = getModule([ 'ListNavigatorProvider' ], false);
const Flux = getModule([ 'useStateFromStores' ], false);

let isInitialized = false;
let lastSelectedTab;
let timeout;

function loadMore (states, reset = false) {
  clearTimeout(timeout);

  if (!reset && states.lastChunk >= states.noteCards.length) {
    return;
  }

  if (reset === true) {
    states.setLastChunk(0);
  }

  states.setLoading(true);

  timeout = setTimeout(() => (states.setLastChunk((reset ? 0 : states.lastChunk) + 10), states.setLoading(false)), 1e3);
}

function maybeLoadMore (states) {
  const scrollerRef = states.ref?.current;
  if (scrollerRef !== null) {
    const scrollerState = scrollerRef.getScrollerState();

    scrollerState.offsetHeight + scrollerState.scrollTop >= scrollerState.scrollHeight - 100 && loadMore(states);
  }
}

function renderSearchBox (states) {
  return <SearchBar
    className={classes.searchBox}
    query={states.query}
    onChange={(query) => states.setQuery(query)}
    onClear={() => states.setQuery('')}
  />;
}

function renderHeader (props, states) {
  const isTabActive = (tab) => states.selectedTab === tab;

  return <div className={classes.header}>
    <Icon name='Manifest' className={classes.threadIcon} />
    <Header size={Header.Sizes.SIZE_16} className={classes.title}>{Messages.NOTEY_NOTES_TOOLTIP}</Header>
    <React.Fragment>
      <div className={classes.divider} />
      {renderSearchBox(states)}
    </React.Fragment>
    <TabBar
      className={[ 'notey-note-browser-tab-bar', classes.tabBar ].filter(Boolean).join(' ')}
      onItemSelect={(selected) => states.setSelectedTab(selected)}
      selectedItem={states.selectedTab}
      type={TabBar.Types.TOP_PILL}
    >
      <TabBar.Item className={[ classes.tab, isTabActive('ALL') && classes.active ].filter(Boolean).join(' ')} id='ALL'>{Messages.FRIENDS_SECTION_ALL}</TabBar.Item>
      <TabBar.Item className={[ classes.tab, isTabActive('FRIENDS') && classes.active ].filter(Boolean).join(' ')} id='FRIENDS'>{Messages.FRIENDS}</TabBar.Item>
    </TabBar>
    <Clickable className={classes.closeIcon} onClick={props.onClose} aria-label={Messages.CLOSE}>
      <Icon name='Close' />
    </Clickable>
  </div>;
}

function renderContent (_, states) {
  const friendIds = relationshipStore.getFriendIDs();
  const filteredNoteCards = states.noteCards.filter(noteCard => {
    if (states.selectedTab === 'FRIENDS') {
      return friendIds.includes(noteCard.key);
    }

    return true;
  }).filter(noteCard => {
    if (states.query !== '') {
      return noteCard.props.user && noteCard.props.user.tag.toLowerCase().includes(states.query.toLowerCase());
    }

    return true;
  });

  const truncatedNoteCards = filteredNoteCards.slice(0, states.lastChunk);

  let singleUserNoteCard;

  if (states.query !== '' && /\d+/.test(states.query)) {
    singleUserNoteCard = states.noteCards.find(noteCard => noteCard.key === states.query);
  }

  if (!singleUserNoteCard && !states.loading && filteredNoteCards.length === 0) {
    return <NoteBrowserEmptyState
      header={Messages.NOTEY_NOTE_BROWSER_EMPTY_STATE_HEADER}
      subtext={Messages[`NOTEY_NOTE_BROWSER_EMPTY_STATE_${states.query !== '' ? 'SEARCH_' : ''}SUBTEXT`]}
    />;
  }

  return <List.ListNavigatorProvider navigator={states.navigator}>
    <List.ListNavigatorContainer>
      {(containerProps) => <AdvancedScrollerThin
        ref={(e) => states.ref.current = e}
        {...(global._.omit(containerProps, [ 'ref' ]))}
        className='notey-note-browser-list'
        onScroll={() => truncatedNoteCards.length === filteredNoteCards.length ? void 0 : maybeLoadMore(states)}
      >
        {singleUserNoteCard || truncatedNoteCards}
        {states.loading ? <Spinner className='notey-note-browser-spinner' /> : null}
      </AdvancedScrollerThin>}
    </List.ListNavigatorContainer>
  </List.ListNavigatorProvider>;
}

module.exports = React.memo((props) => {
  Flux.useStateFromStores([ NotesStore ], () => ({}));

  const notes = NotesStore.getNotes();
  const noteCards = Object.keys(notes).map(userId => {
    const note = notes[userId];
    const user = userStore.getUser(userId);

    return <UserNoteCard note={note} user={user} userId={userId} key={userId} />;
  });

  !function (userIds) {
    const users = React.useMemo(() => {
      let members = {};
      let guildMembers = {};

      const guildId = guildStore.getGuildId();

      return (!guildId || userIds === null || userIds.length > 50)
        ? {}
        : (guildMembers[guildId] = (members = userIds) && members !== void 0 ? members : [], guildMembers);
    }, [ userIds ]);

    useSubscribeGuildMembers(users);
  }(Object.keys(NotesStore.getNotes()));

  const ref = React.useRef(null);
  const navigator = getAllModules(m => typeof m.default === 'function' && m.default.toString().includes('keyboardModeEnabled'), false)[2].default('notes', ref);

  const [ lastChunk, setLastChunk ] = React.useState(isInitialized ? 10 : null);
  const [ loading, setLoading ] = React.useState(noteCards.length > 0 && !isInitialized);
  const [ selectedTab, setSelectedTab ] = React.useState(lastSelectedTab || 'ALL');
  const [ query, setQuery ] = React.useState('');

  const states = {
    ref,
    navigator,
    noteCards,
    lastChunk,
    loading,
    selectedTab,
    query,
    setLastChunk,
    setLoading,
    setSelectedTab,
    setQuery
  };

  React.useEffect(() => {
    if (!isInitialized && noteCards.length > 0) {
      loadMore(states);

      isInitialized = true;
    }
  }, []);

  React.useEffect(() => {
    lastSelectedTab !== selectedTab && loadMore(states, true);

    return () => (lastSelectedTab = selectedTab);
  }, [ selectedTab ]);

  return (
    <div className={[ 'notey-note-browser', classes.browser, classes.container ].join(' ')}>
      {renderHeader(props, states)}
      {renderContent(props, states)}
    </div>
  );
});
