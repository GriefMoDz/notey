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

const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icon } = require('powercord/components');

const Tooltip = getModuleByDisplayName('Tooltip', false);
const classes = getModule([ 'member', 'ownerIcon' ], false);

const { getId: getCurrentUserId } = getModule([ 'initialize', 'getFingerprint' ], false);

const Lodash = window._;

function renderNoteIcon ({ props, isSelf }) {
  const locationKey = Lodash.upperFirst(Lodash.camelCase(props.location));

  // eslint-disable-next-line multiline-ternary
  return props.getSetting(`noteIcon-${locationKey}`, true) ? <Tooltip
    text={props.hasNote} // Instead display the Note
    //text={Messages.NOTEY_NOTE_ICON_TOOLTIP.format({ target: isSelf ? 'yourself' : 'this user' })}
    hideOnClick={false}
  >
    {(props) => <div className='notey-noteIcon' {...props}>
      <Icon name='Manifest' className={classes.icon} {...props} />
    </div>}
  </Tooltip> : null;
}

module.exports = React.memo(props => {
  if (!props.hasNote) {
    return null;
  }

  const { getSetting } = props;

  const settings = {
    showOnBots: getSetting('noteIcon-showOnBots', true),
    showOnSelf: getSetting('noteIcon-showOnSelf', true)
  };

  const isSelf = props.user?.id === getCurrentUserId();

  if (!props.user || (props.user.bot && !settings.showOnBots) ||(isSelf && !settings.showOnSelf)) {
    return null;
  }

  return renderNoteIcon({ props, isSelf });
});
