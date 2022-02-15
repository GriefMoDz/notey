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

const { React } = require('powercord/webpack');

const Lodash = window._;

module.exports = React.memo(
  (props) => <svg
    {...Lodash.omit(props, [ 'width', 'height', 'color', 'foreground' ])}
    className={props.className ?? null}
    aria-hidden={props['aria-hidden'] ?? false}
    width={props.width ?? 24}
    height={props.height ?? 24}
    viewBox='0 0 24 24'
  >
    <path
      className={props.foreground}
      fill={props.color ?? 'currentColor'}
      d='M20 1.707V4.293L16.707 1L15.293 2.414L18.586 5.707H16V7.707H22V1.707H20ZM5 14.707H8V8.70697C8 7.60497 8.897 6.70697 10 6.70697H14V3.70697C14 2.60497 13.103 1.70697 12 1.70697H5C3.897 1.70697 3 2.60497 3 3.70697V12.707C3 13.809 3.897 14.707 5 14.707ZM12 8.70697H19C20.103 8.70697 21 9.60497 21 10.707V19.707C21 20.81 20.103 21.707 19 21.707H12C10.897 21.707 10 20.81 10 19.707V10.707C10 9.60497 10.897 8.70697 12 8.70697ZM16 12.707V11.707H12V12.707H16ZM12 18.707H19V17.707H12V18.707ZM12 15.707H19V14.707H12V15.707Z'
    />
  </svg>
);
