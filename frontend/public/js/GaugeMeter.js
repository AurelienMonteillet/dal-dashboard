/*
 * AshAlom Gauge Meter.  Version 2.0.0
 * Copyright AshAlom.com  All rights reserved.
 * https://github.com/AshAlom/GaugeMeter/
 * Licensed under the MIT license
 * Date: 2018-02-27T32:47:12.356Z
 * Contacted AshAlom.com 2018-02-27
 * Created by Dr Ash Alom
 */
(function ($) {
  $.fn.gaugeMeter = function (t) {
    var settings = $.extend(
      {
        id: '',
        percent: 0,
        used: null,
        total: null,
        size: 100,
        prepend: '',
        append: '',
        theme: 'Red-Gold-Green',
        color: '',
        back: 'RGBa(0,0,0,.06)',
        width: 3,
        style: 'Full',
        stripe: '0',
        animationstep: 1,
        animate_gauge_colors: false,
        animate_text_colors: false,
        label: '',
        label_color: 'Black',
        text: '',
        text_size: 0.22,
        fill: '',
        showvalue: false
      },
      t
    );
    return this.each(function () {
      function getThemeColor(e) {
        var t = '#2C94E0';
        return e || (e = 1e-14),
          'Red-Gold-Green' === settings.theme && (t = e > 90 ? '#FF4500' : e > 40 ? '#f9c802' : '#a9d70b'),
          'Green-Gold-Red' === settings.theme && (t = e > 90 ? '#a9d70b' : e > 40 ? '#f9c802' : '#FF4500'),
          'Green-Red' === settings.theme && (t = e > 50 ? '#a9d70b' : '#FF4500'),
          'Red-Green' === settings.theme && (t = e > 50 ? '#FF4500' : '#a9d70b'),
          'DarkBlue-LightBlue' === settings.theme && (t = e > 50 ? '#1A5AAE' : '#2C94E0'),
          'LightBlue-DarkBlue' === settings.theme && (t = e > 50 ? '#2C94E0' : '#1A5AAE'),
          'DarkRed-LightRed' === settings.theme && (t = e > 50 ? '#B22222' : '#FF4500'),
          'LightRed-DarkRed' === settings.theme && (t = e > 50 ? '#FF4500' : '#B22222'),
          'Blue' === settings.theme && (t = '#3B82F6'),
          'Sky' === settings.theme && (t = '#00BFFF'),
          t;
      }
      /* The label below gauge. */
      function createLabel(t, a) {
        if (settings.showvalue) {
          t = Math.ceil(t / 100 * a);
        }
        var n = Math.ceil(a * settings.size),
          l = Math.ceil(settings.size * settings.text_size),
          r = settings.prepend + t + settings.append;
        $('<div></div>')
          .addClass('gaugeMeter-label')
          .text(r)
          .css({
            color: settings.label_color,
            'font-size': l + 'px',
            'font-weight': 'bold',
            'font-family': 'Arial, sans-serif',
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'z-index': 1000
          })
          .appendTo($('div', this));
      }
      /* Prepend and append text, the gauge text or percentage value. */
      function createSpanTag(t) {
        var fgcolor = '';
        if (settings.animate_text_colors === true) {
          fgcolor = settings.fgcolor;
        }
        var child = t.children('span');
        if (child.length !== 0) {
          child.html(r).css({ color: fgcolor });
          return;
        }
        if (settings.text_size <= 0.0 || Number.isNaN(settings.text_size)) {
          settings.text_size = 0.22;
        }
        if (settings.text_size > 0.5) {
          settings.text_size = 0.5;
        }
        $('<span></span>')
          .appendTo(t)
          .html(r)
          .css({
            'line-height': settings.size + 'px',
            'font-size': settings.text_size * settings.size + 'px',
            color: fgcolor
          });
      }
      /* Get data attributes as options from div tag. Fall back to defaults when not exists. */
      function getDataAttr(t) {
        $.each(dataAttr, function (index, element) {
          if (t.data(element) !== undefined && t.data(element) !== null) {
            settings[element] = t.data(element);
          } else {
            settings[element] = $(defaults).attr(element);
          }

          if (element === 'fill') {
            s = settings[element];
          }

          if (
            (element === 'size' ||
              element === 'width' ||
              element === 'animationstep' ||
              element === 'stripe') &&
            !Number.isInteger(settings[element])
          ) {
            settings[element] = parseInt(settings[element]);
          }

          if (element === 'text_size') {
            settings[element] = parseFloat(settings[element]);
          }
        });
      }
      /* Draws the gauge. */
      function drawGauge(a) {
        if (settings.animate_gauge_colors) {
          // Set gauge color for each value change.
          settings.fgcolor = getThemeColor(a * 100);
        }
        if (M < 0) M = 0;
        if (M > 100) M = 100;
        var lw =
          settings.width < 1 || isNaN(settings.width)
            ? settings.size / 20
            : settings.width;
        g.clearRect(0, 0, b.width, b.height);
        g.beginPath();
        g.arc(m, v, x, G, k, !1);
        if (s) {
          g.fillStyle = settings.fill;
          g.fill();
        }
        g.lineWidth = lw;
        g.strokeStyle = settings.back;
        settings.stripe > parseInt(0)
          ? g.setLineDash([settings.stripe], 1)
          : (g.lineCap = 'round');
        g.stroke();
        g.beginPath();
        g.arc(m, v, x, -I, P * a - I, !1);
        g.lineWidth = lw;
        g.strokeStyle = settings.fgcolor;
        g.stroke();
        c > M &&
          ((M += z),
            requestAnimationFrame(function () {
              drawGauge(Math.min(M, c) / 100);
              if (settings.animate_text_colors) {
                // Set text color for each value change.
                $(p).find('span').css({ color: settings.fgcolor });
              }
              if (defaults.showvalue === true || settings.showvalue === true) {
                $(p).find('output').text(settings.used);
              } else {
                $(p).find('output').text(M);
              }
            }, p));
      }

      $(this).attr('data-id', $(this).attr('id'));
      var r,
        dataAttr = [
          'percent',
          'used',
          'min',
          'total',
          'size',
          'prepend',
          'append',
          'theme',
          'color',
          'back',
          'width',
          'style',
          'stripe',
          'animationstep',
          'animate_gauge_colors',
          'animate_text_colors',
          'label',
          'label_color',
          'text',
          'text_size',
          'fill',
          'showvalue'
        ],
        c = 0,
        p = $(this),
        s = false;
      p.addClass('gaugeMeter');
      getDataAttr(p);

      if (Number.isInteger(settings.used) && Number.isInteger(settings.total)) {
        var u = settings.used;
        var t = settings.total;
        if (Number.isInteger(settings.min)) {
          t -= settings.min;
          u -= settings.min;
        }
        c = u / (t / 100);
      } else {
        if (Number.isInteger(settings.percent)) {
          c = settings.percent;
        } else {
          c = parseInt(defaults.percent);
        }
      }
      if (c < 0) c = 0;
      if (c > 100) c = 100;

      if (
        settings.text !== '' &&
        settings.text !== null &&
        settings.text !== undefined
      ) {
        if (
          settings.append !== '' &&
          settings.append !== null &&
          settings.append !== undefined
        ) {
          r = settings.text + '<u>' + settings.append + '</u>';
        } else {
          r = settings.text;
        }
        if (
          settings.prepend !== '' &&
          settings.prepend !== null &&
          settings.prepend !== undefined
        ) {
          r = '<s>' + settings.prepend + '</s>' + r;
        }
      } else {
        if (defaults.showvalue === true || settings.showvalue === true) {
          r = '<output>' + settings.used + '</output>';
        } else {
          r = '<output>' + c.toString() + '</output>';
        }
        if (
          settings.prepend !== '' &&
          settings.prepend !== null &&
          settings.prepend !== undefined
        ) {
          r = '<s>' + settings.prepend + '</s>' + r;
        }

        if (
          settings.append !== '' &&
          settings.append !== null &&
          settings.append !== undefined
        ) {
          r = r + '<u>' + settings.append + '</u>';
        }
      }

      settings.fgcolor = getThemeColor(c);
      createSpanTag(p);

      if (
        settings.style !== '' &&
        settings.style !== null &&
        settings.style !== undefined
      ) {
        createLabel(settings.text || settings.percent, settings.size / 13);
      }

      $(this).width(settings.size + 'px');

      var b = $('<canvas></canvas>')
        .attr({ width: settings.size, height: settings.size })
        .get(0),
        g = b.getContext('2d'),
        m = b.width / 2,
        v = b.height / 2,
        x = (360 * settings.percent * (Math.PI / 180), b.width / 2.5),
        k = 2.3 * Math.PI,
        G = 0,
        M = 0 === settings.animationstep ? c : 0,
        z = Math.max(settings.animationstep, 0),
        P = 2 * Math.PI,
        I = Math.PI / 2;
      var child = $(this).children('canvas');
      if (child.length !== 0) {
        /* Replace existing canvas when new percentage was written. */
        child.replaceWith(b);
      } else {
        /* Initially create canvas. */
        $(b).appendTo($(this));
      }

      if ('Semi' === settings.style) {
        k = 2 * Math.PI;
        G = 3.13;
        P = 1 * Math.PI;
        I = Math.PI / 0.996;
      } else if ('Arch' === settings.style) {
        k = 2.195 * Math.PI;
        G = 655.99999;
        P = 1.4 * Math.PI;
        I = Math.PI / 0.8335;
      }
      drawGauge(M / 100);
    });
  };
})(jQuery);
