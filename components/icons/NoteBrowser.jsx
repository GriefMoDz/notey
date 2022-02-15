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

const { React, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { HeaderBar } = require('powercord/components');

const NoteBrowser = require('../misc/NoteBrowser');
const ErrorBoundary = require('../misc/ErrorBoundary');
const ManifestIcon = require('./Manifest');

const Popout = getModuleByDisplayName('Popout', false);

module.exports = React.memo(() => {
  const [ visibility, setVisibility ] = React.useState(false);

  const handleOnClose = React.useCallback(() => setVisibility(false), []);
  const handleOnClick = React.useCallback(() => setVisibility(!visibility), [ visibility ]);

  return (
    <ErrorBoundary>
      <Popout
        animation={Popout.Animation.NONE}
        position={Popout.Positions.BOTTOM}
        align={Popout.Align.RIGHT}
        autoInvert={false}
        shouldShow={visibility}
        onRequestClose={handleOnClose}
        renderPopout={() => <NoteBrowser onClose={handleOnClose} />}
        ignoreModalClicks={true}
      >
        {(popoutProps, { isShown: selected }) => <HeaderBar.Icon
          {...popoutProps}
          icon={(props) => <ManifestIcon {...props} />}
          onClick={handleOnClick}
          aria-label={Messages.NOTEY_NOTES_TOOLTIP}
          tooltip={selected ? null : Messages.NOTEY_NOTES_TOOLTIP}
          selected={selected}
        />}
      </Popout>
    </ErrorBoundary>
  );
});
