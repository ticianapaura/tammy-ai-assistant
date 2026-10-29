/* @ds-bundle: {"format":4,"namespace":"Tammy","components":[{"name":"ChatHeader"},{"name":"UserMessage"},{"name":"AssistantMessage"},{"name":"TypingIndicator"},{"name":"OptionButtons"},{"name":"Welcome"},{"name":"Composer"},{"name":"FeedbackTextarea"},{"name":"Banner"},{"name":"SystemNote"},{"name":"StatusPill"},{"name":"Button"},{"name":"RatingScale"},{"name":"SatisfactionSurvey"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect, useEffect = React.useEffect, useId = React.useId;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }

  /* Icons — provisional line icons drawn to match the designs; replace with the exported SVGs. */
  function svg(size, children, extra) {
    return h('svg', Object.assign({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' }, extra), children);
  }
  var Icon = {
    bot: function (s) { return svg(s || 20, [h('rect', { key: 1, x: 5, y: 4, width: 14, height: 8, rx: 3 }), h('rect', { key: 2, x: 5, y: 14, width: 14, height: 6, rx: 3 }), h('circle', { key: 3, cx: 9.5, cy: 8, r: 0.9, fill: 'currentColor', stroke: 'none' }), h('circle', { key: 4, cx: 14.5, cy: 8, r: 0.9, fill: 'currentColor', stroke: 'none' })]); },
    minus: function () { return svg(12, h('path', { d: 'M6 12h12' })); },
    close: function (s) { return svg(s || 12, h('path', { d: 'M7 7l10 10M17 7L7 17' })); },
    send: function () { return svg(20, h('path', { d: 'M4 6l7 6-7 6M10 6h4l7 6-7 6h-4' })); },
    thumbUp: function () { return svg(18, h('path', { d: 'M8 10v10H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zm0 0l4-6a2 2 0 0 1 3 1.7V9h4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H8' })); },
    thumbDown: function () { return svg(18, h('path', { d: 'M16 14V4h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3zm0 0l-4 6a2 2 0 0 1-3-1.7V15H5a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.2 4H16' })); },
    info: function () { return svg(18, [h('circle', { key: 1, cx: 12, cy: 12, r: 9 }), h('path', { key: 2, d: 'M12 11v5M12 8h.01' })]); },
    alert: function () { return svg(18, [h('circle', { key: 1, cx: 12, cy: 12, r: 9 }), h('path', { key: 2, d: 'M12 7v6M12 16h.01' })]); },
    warning: function () { return svg(16, [h('path', { key: 1, d: 'M12 4l9 16H3L12 4z' }), h('path', { key: 2, d: 'M12 10v4M12 17h.01' })]); },
    retry: function (s) { return svg(s || 16, [h('path', { key: 1, d: 'M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3' }), h('path', { key: 2, d: 'M18 3v4h-4M6 21v-4h4' })]); },
    redo: function () { return svg(16, h('path', { d: 'M19 12a7 7 0 1 1-2-4.9M19 4v4h-4' })); },
    arrow: function () { return svg(18, h('path', { d: 'M5 12h14M13 6l6 6-6 6' })); },
    continueArrow: function () { return svg(16, h('path', { d: 'M4 6v12M8 12h12M16 8l4 4-4 4' })); },
    spinner: function (s) { return h('span', { className: 'tm-spinner', 'aria-hidden': true }, svg(s || 16, h('path', { d: 'M12 3a9 9 0 1 1-8.5 6' }))); },
    check: function () { return svg(14, h('path', { d: 'M5 12l5 5 9-10' })); },
    checkCircle: function () { return svg(72, [h('circle', { key: 1, cx: 12, cy: 12, r: 10 }), h('path', { key: 2, d: 'M7.5 12.5l3 3 6-7' })], { strokeWidth: 2 }); },
    xCircle: function () { return svg(72, [h('circle', { key: 1, cx: 12, cy: 12, r: 10 }), h('path', { key: 2, d: 'M8 8l8 8M16 8l-8 8' })], { strokeWidth: 2 }); },
    xOctagon: function () { return svg(18, [h('path', { key: 1, d: 'M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z' }), h('path', { key: 2, d: 'M9 9l6 6M15 9l-6 6' })]); }
  };

  /* ChatHeader */
  function ChatHeader(props) {
    var name = props.name || 'Tammy';
    return h('header', { className: 'tm-root tm-header' },
      h('h2', { className: 'tm-header-name' }, name, h('span', { style: { display: 'inline-flex' } }, Icon.bot(20))),
      h('div', { className: 'tm-header-actions' },
        h('button', { type: 'button', className: 'tm-btn-reset tm-round', 'aria-label': 'Minimize chat', onClick: props.onMinimize }, Icon.minus()),
        h('button', { type: 'button', className: 'tm-btn-reset tm-round', 'aria-label': 'Close chat', onClick: props.onClose }, Icon.close())));
  }

  /* UserMessage */
  function UserMessage(props) {
    return h('div', { className: 'tm-root tm-user' }, props.children);
  }

  /* AssistantMessage */
  function Feedback(props) {
    var s = useState(props.defaultValue || null), v = s[0], set = s[1];
    function pick(next) { var n = v === next ? null : next; set(n); if (props.onChange) props.onChange(n); }
    return h('div', { className: 'tm-thumbs', role: 'group', 'aria-label': 'Rate this answer' },
      h('button', { type: 'button', className: 'tm-btn-reset', 'aria-label': 'Helpful', 'aria-pressed': v === 'up', onClick: function () { pick('up'); } }, Icon.thumbUp()),
      h('button', { type: 'button', className: 'tm-btn-reset', 'aria-label': 'Not helpful', 'aria-pressed': v === 'down', onClick: function () { pick('down'); } }, Icon.thumbDown()));
  }
  function AssistantMessage(props) {
    var sender = props.sender || 'Tammy';
    return h('div', { className: 'tm-root tm-assistant' },
      h('span', { className: 'tm-assistant-icon', title: sender }, Icon.bot(24), h('span', { className: 'tm-sr' }, sender + ' says')),
      h('div', { className: 'tm-assistant-body' }, props.children,
        props.feedback === false ? null : h(Feedback, { defaultValue: props.defaultFeedback, onChange: props.onFeedback })));
  }

  /* TypingIndicator */
  function TypingIndicator(props) {
    return h('div', { className: 'tm-root tm-typing', role: 'status' },
      h('span', { className: 'tm-typing-icon' }, Icon.bot(24)),
      h('span', { className: 'tm-typing-text' }, props.label || 'Writing...'));
  }

  /* OptionButtons */
  function OptionButtons(props) {
    var count = props.count || 5;
    var s = useState(null), v = s[0], set = s[1];
    var items = [];
    for (var i = 1; i <= count; i++) {
      (function (n) {
        items.push(h('button', { key: n, type: 'button', className: 'tm-btn-reset tm-option', 'aria-pressed': v === n, disabled: v !== null && v !== n,
          onClick: function () { set(n); if (props.onSelect) props.onSelect(n); } }, n));
      })(i);
    }
    return h('div', { className: 'tm-root tm-options', role: 'group', 'aria-label': props.label || 'Choose an option' }, items);
  }

  /* Banner */
  var actionIcons = { retry: function () { return Icon.redo(); }, continue: function () { return Icon.continueArrow(); } };
  var roundIcons = { retry: function () { return Icon.retry(18); }, continue: function () { return Icon.arrow(); } };
  function Banner(props) {
    var tone = props.tone || 'error';
    var layout = props.layout || 'wide';
    var action = tone === 'info' ? null : (props.action || 'retry');
    var label = props.actionLabel || (action === 'continue' ? 'Continue' : 'Try again');
    var btn = null;
    if (action) {
      btn = layout === 'compact'
        ? h('button', { type: 'button', className: 'tm-btn-reset tm-banner-round', 'aria-label': label, onClick: props.onAction }, roundIcons[action]())
        : h('button', { type: 'button', className: 'tm-btn-reset tm-banner-btn', onClick: props.onAction }, actionIcons[action](), label);
    }
    return h('div', { className: cx('tm-root tm-banner', tone === 'info' && 'is-info'), role: tone === 'info' ? 'note' : 'alert' },
      h('span', { className: 'tm-banner-icon' }, tone === 'info' ? Icon.info() : Icon.alert()),
      h('p', { className: 'tm-banner-text' }, props.children),
      btn);
  }

  /* SystemNote */
  function SystemNote(props) {
    return h('p', { className: 'tm-root tm-note', role: 'status' }, props.children);
  }

  /* StatusPill */
  function StatusPill(props) {
    if (props.variant === 'loading') {
      return h('div', { className: 'tm-root tm-status-center', role: 'status' },
        h('span', { className: 'tm-pill is-loading' }, Icon.spinner(16), props.children));
    }
    return h('div', { className: 'tm-root tm-divider', role: 'separator', 'aria-label': typeof props.children === 'string' ? props.children : undefined },
      h('span', { className: 'tm-pill' }, props.children));
  }

  /* Composer */
  function Composer(props) {
    var max = props.maxLength || 200;
    var s = useState(props.defaultValue || ''), value = s[0], setValue = s[1];
    var m = useState(false), multi = m[0], setMulti = m[1];
    var ref = useRef(null);
    var wrapAt = useRef(0);
    var helperId = useId();
    useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      el.style.height = 'auto';
      var wraps = el.scrollHeight > 28;
      // The multi-line layout is wider, so keep it until the text is clearly shorter
      // than where it first wrapped; otherwise the field flickers at the edge.
      var next = multi ? value.length >= wrapAt.current - 4 && value.length > 0 : wraps;
      if (!multi && wraps) wrapAt.current = value.length;
      if (next !== multi) setMulti(next);
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }, [value, multi]);
    var disabled = !!props.disabled;
    var over = value.length > max;
    var ready = !disabled && !over && value.trim().length > 0;
    function send() {
      if (!ready) return;
      if (props.onSend) props.onSend(value.trim());
      setValue('');
    }
    var sendBtn = h('button', { type: 'button', className: cx('tm-btn-reset tm-send', ready && 'is-ready', over && 'is-error'), 'aria-label': 'Send message',
      disabled: disabled || (!ready && !over), 'aria-disabled': over || undefined, onClick: send }, Icon.send());
    var counter = multi || over ? h('span', { className: 'tm-counter', 'aria-live': 'polite' }, value.length + '/' + max) : null;
    var field = h('textarea', { ref: ref, rows: 1, value: value, disabled: disabled, placeholder: props.placeholder || 'Type...', 'aria-label': props.label || 'Message',
      'aria-invalid': over || undefined, 'aria-describedby': over ? helperId : undefined,
      onChange: function (e) { setValue(e.target.value); },
      onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } } });
    return h('div', { className: 'tm-root tm-composer-wrap' },
      h('div', { className: cx('tm-composer', multi && 'is-multi', over && 'is-error', disabled && 'is-disabled') },
        field,
        multi ? h('div', { className: 'tm-composer-foot' }, counter, sendBtn) : counter,
        multi ? null : sendBtn),
      over ? h('p', { id: helperId, className: 'tm-helper', style: { margin: 0 } }, Icon.warning(), 'Your input exceeds the maximum allowed length!') : null);
  }

  /* FeedbackTextarea */
  function FeedbackTextarea(props) {
    return h('textarea', { className: 'tm-root tm-textarea', placeholder: props.placeholder || 'Share your thoughts...', 'aria-label': props.label || 'Share your thoughts',
      defaultValue: props.defaultValue, onChange: props.onChange, maxLength: props.maxLength });
  }

  /* Button */
  function Button(props) {
    var state = props.state || 'idle';
    var variant = props.variant || 'accent';
    var content = props.children;
    if (state === 'loading') content = [h('span', { key: 's' }, Icon.spinner(16)), h('span', { key: 't', className: 'tm-sr' }, 'Sending')];
    if (state === 'done') content = [h('span', { key: 't' }, props.doneLabel || 'Sent feedback'), h('span', { key: 'i', style: { display: 'inline-flex' } }, Icon.check())];
    return h('button', { type: props.type || 'button', className: cx('tm-btn-reset tm-root tm-button', variant === 'danger' && 'is-danger'),
      disabled: state !== 'idle' || props.disabled, 'aria-busy': state === 'loading' || undefined, onClick: props.onClick }, content);
  }

  /* RatingScale */
  function RatingScale(props) {
    var s = useState(props.defaultValue || null), v = s[0], set = s[1];
    var labelId = useId();
    var items = [];
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        items.push(h('button', { key: n, type: 'button', role: 'radio', 'aria-checked': v === n, 'data-n': n, tabIndex: (v === n || (v === null && n === 1)) ? 0 : -1,
          className: 'tm-btn-reset tm-rating-item', onClick: function () { set(n); if (props.onChange) props.onChange(n); },
          onKeyDown: function (e) {
            var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
            if (!d) return; e.preventDefault();
            var next = Math.min(5, Math.max(1, (v || n) + d)); set(next); if (props.onChange) props.onChange(next);
            var sib = e.currentTarget.parentNode.children[next - 1]; if (sib) sib.focus();
          } }, n));
      })(i);
    }
    return h('div', { className: cx('tm-root tm-rating', props.variant === 'color' && 'is-color') },
      h('span', { className: 'tm-rating-label', id: labelId }, 'Very unsatisfied'),
      h('div', { className: 'tm-rating-group', role: 'radiogroup', 'aria-label': props.label || 'Satisfaction from 1, very unsatisfied, to 5, very satisfied' }, items),
      h('span', { className: 'tm-rating-label is-end' }, 'Very satisfied'));
  }

  /* SatisfactionSurvey — rating → comment → sending → sent | failed */
  function SatisfactionSurvey(props) {
    var st = useState(props.initialStep || 'rating'), step = st[0], setStep = st[1];
    var timer = useRef(null);
    useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
    var question = props.question || 'How satisfied are you with your recent support experience?';
    function submit() {
      setStep('sending');
      var outcome = props.simulate || 'success';
      if (props.onSubmit) props.onSubmit();
      timer.current = setTimeout(function () { setStep(outcome === 'error' ? 'failed' : 'sent'); }, props.delay || 1400);
    }
    var close = h('button', { type: 'button', className: 'tm-btn-reset tm-survey-close', 'aria-label': 'Close survey', onClick: props.onClose }, Icon.close(14));
    var body;
    if (step === 'rating') {
      body = [h('h3', { key: 'q', className: 'tm-survey-title' }, question),
        h(RatingScale, { key: 'r', variant: props.ratingVariant, onChange: function () { timer.current = setTimeout(function () { setStep('comment'); }, 350); } })];
    } else if (step === 'comment' || step === 'sending' || step === 'retry') {
      body = [h('h3', { key: 'q', className: 'tm-survey-title' }, question),
        h(FeedbackTextarea, { key: 't' }),
        step === 'retry' ? h('p', { key: 'e', className: 'tm-survey-error' }, Icon.xOctagon(), 'Your feedback could not be sent. Try again') : null,
        h('div', { key: 'a', className: 'tm-survey-actions' }, h(Button, { state: step === 'sending' ? 'loading' : 'idle', onClick: submit }, 'Send feedback'))];
    } else if (step === 'sent') {
      body = [h('h3', { key: 'q', className: 'tm-survey-title is-result', role: 'status' }, 'Thank you for your feedback'),
        h('div', { key: 'i', className: 'tm-survey-result', style: { color: 'var(--color-success-icon)' } }, Icon.checkCircle())];
    } else {
      body = [h('h3', { key: 'q', className: 'tm-survey-title is-result', role: 'alert' }, 'Your feedback hasn’t been sent'),
        h('div', { key: 'i', className: 'tm-survey-result', style: { color: 'var(--color-danger-icon)' } }, Icon.xCircle()),
        h('div', { key: 'a', className: 'tm-survey-actions' }, h(Button, { onClick: function () { setStep('retry'); } }, 'Try again'))];
    }
    return h('section', { className: 'tm-root tm-survey', 'aria-label': 'Satisfaction survey' }, close, body);
  }

  /* Welcome */
  function Welcome(props) {
    var name = props.name || 'Tammy';
    return h('div', { className: 'tm-root tm-welcome' },
      h('h1', null, 'Welcome!'),
      h('p', null, 'I’m ' + name + ', your AI assistant, how can I help you today?'),
      h(Banner, { tone: 'info' }, props.notice || ('For your security, avoid sharing sensitive information. ' + name + ' can’t access account details. For support requests, visit the Support Hub.')));
  }

  window.Tammy = Object.assign(window.Tammy || {}, {
    ChatHeader: ChatHeader, UserMessage: UserMessage, AssistantMessage: AssistantMessage, TypingIndicator: TypingIndicator,
    OptionButtons: OptionButtons, Welcome: Welcome, Composer: Composer, FeedbackTextarea: FeedbackTextarea, Banner: Banner,
    SystemNote: SystemNote, StatusPill: StatusPill, Button: Button, RatingScale: RatingScale, SatisfactionSurvey: SatisfactionSurvey,
    Icon: Icon
  });
})();
