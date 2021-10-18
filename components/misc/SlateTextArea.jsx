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

const { React, getModule, getModuleByDisplayName, channels, constants: { KeyboardKeys } } = require('powercord/webpack');

const SlateChannelTextArea = getModuleByDisplayName('SlateChannelTextArea', false);
const SlateMarkdownComponents = getModule([ 'UserMention' ], false);

const parsePlainText = getModule(m => typeof m.default === 'function' && m.default.toString().includes('getCustomEmoji'), false).default;
const channelStore = getModule([ 'getChannel' ], false);
const guildStore = getModule([ 'getGuildId' ], false);

module.exports = class SlateTextArea extends SlateChannelTextArea {
  constructor (props) {
    super(props);

    props.guildId = props.guildId || guildStore.getGuildId();
    props.channelId = props.channelId || channels.getChannelId();
    props.channel = props.channel || channelStore.getChannel(props.channelId);
    props.resolvePlaintextMention = (e) => parsePlainText(e, props.channel);
    props.renderers = this.renderers;

    this.handleChange = (e) => {
      if (this.props.maxLength) {
        if (e.value.document.text.length > this.props.maxLength) {
          this.editorRef.deleteBackward(e.value.document.text.length - this.props.maxLength);
        }
      }

      if (this.props.rows) {
        if (e.value.document.nodes.size > this.props.rows) {
          this.editorRef.deleteBackward(e.value.document.nodes.size - this.props.rows);
        }
      }

      this.setValue(e.value);
    };

    if (props.type === 'note') {
      this.handleClick = (_, __, r) => (this.props.onClick?.(), r());

      const oldHandleKeyDown = this.handleKeyDown;

      this.handleKeyDown = (e, t, r) => {
        const blacklist = [ KeyboardKeys.ARROW_UP, KeyboardKeys.ARROW_DOWN, KeyboardKeys.ESCAPE, KeyboardKeys.N, KeyboardKeys.P ];

        if (!blacklist.includes(e.which)) {
          oldHandleKeyDown(e, t, r);
        }
      };
    }

    this.plugins = this.createPlugins();
  }

  get renderers () {
    return {
      renderEmoji: (e) => {
        return React.createElement(SlateMarkdownComponents.Emoji, {
          emoji: e,
          channel: this.props.channel
        })
      },
      renderCustomEmoji: (e) => {
        return React.createElement(SlateMarkdownComponents.CustomEmoji, {
          emoji: e,
          channel: this.props.channel
        })
      },
      renderTextMention: (e) => {
        return React.createElement(SlateMarkdownComponents.TextMention, {
          text: e,
          channel: this.props.channel
        })
      },
      renderUserMention: (e) => {
        return React.createElement(SlateMarkdownComponents.UserMention, {
          id: e,
          channel: this.props.channel
        })
      },
      renderRoleMention: (e) => {
        return React.createElement(SlateMarkdownComponents.RoleMention, {
          id: e,
          channel: this.props.channel
        })
      },
      renderChannelMention: (e) => {
        return React.createElement(SlateMarkdownComponents.ChannelMention, {
          id: e,
          channel: this.props.channel
        })
      }
    };
  }

  insertText (text, appendSpace = true) {
    if (this.props.type === 'note') {
      this.withEditor(editorRef => {
        editorRef.ensureSelection();

        this.insertText(editorRef, text + (appendSpace ? ' ' : ''), 'line');
      });
    } else {
      super.insertText(...args);
    }
  }

  handleTabOrEnterDown (e) {
    if (this.props.type === 'note') {
      if (e.which === KeyboardKeys.TAB) {
        if (this.hasOpenPlainTextCodeBlock()) {
          e.preventDefault();
          e.stopPropagation();

          this.insertText('  ', false);
        }
      } else if (e.which === KeyboardKeys.ENTER && !e.ctrlKey && !e.shiftKey && !this.hasOpenPlainTextCodeBlock()) {
        e.preventDefault();
        e.stopPropagation();

        return true;
      }
    } else {
      return super.handleTabOrEnterDown(e);
    }
  }

  render () {
    const res = super.render();

    if (this.props.type === 'note') {
      this.props.onPasteItem = () => true;

      const SlateChannelTextArea = res.props.children[1].props.children[1];

      const newProps = {
        handleClick: this.handleClick,
        className: SlateChannelTextArea.props.className.split(' ').pop(),
        style: { minHeight: 40 }
      }

      Object.assign(SlateChannelTextArea.props, newProps);

      delete res.props.children[0];
    }

    return res;
  }
};
