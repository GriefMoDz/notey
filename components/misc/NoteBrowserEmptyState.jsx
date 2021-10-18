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

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Icon } = require('powercord/components');

const classes = getModule([ 'header', 'stars' ], false);

const Text = getModuleByDisplayName('Text', false);
const Header = getModuleByDisplayName('Header', false);
const InboxEmptyStateStars = getModuleByDisplayName('InboxEmptyStateStars', false);

module.exports = (props) => {
  return (
    <div className={classes.container}>
      <div className={classes.iconContainer}>
        <div className={classes.icon}>
          <Icon name='Manifest' width={36} height={36} />
        </div>
        <InboxEmptyStateStars className={classes.stars} />
      </div>
      <Header className={classes.header} size={Header.Sizes.SIZE_24}>
        {props.header}
      </Header>
      <Text color={Text.Colors.HEADER_SECONDARY} size={Text.Sizes.SIZE_16}>
        {props.subtext}
      </Text>
    </div>
  );
}
