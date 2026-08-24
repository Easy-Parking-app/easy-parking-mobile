# -*- coding: utf-8 -*-
"""
Genera los documentos para inversores.

    py scripts/generate-investor-pdfs.py

Produce en docs/inversores/:

    easy-parking-pitch-deck.pdf       presentacion, apaisada
    easy-parking-resumen-ejecutivo.pdf  una pagina
    easy-parking-modelo-financiero.pdf  modelo con supuestos explicitos

Se genera por codigo y no a mano por la misma razon que los iconos: cuando
cambie una cifra, se cambia aqui y se vuelve a correr, en vez de editar tres
archivos y que uno se quede atras.

REGLA: aqui no hay ni un dato inventado presentado como hecho. Lo que son
supuestos va rotulado como supuestos, y lo que falta averiguar va rotulado como
pendiente. Un numero inflado en un documento para inversores no es una licencia
creativa: es lo que hace que la primera llamada de diligencia sea la ultima.
"""

import os
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

# Paleta, la misma de src/constants/theme.ts
INK = HexColor('#0A0D12')
INK_2 = HexColor('#5B6472')
INK_3 = HexColor('#8C94A1')
ACCENT = HexColor('#3D3BE8')
SURFACE = HexColor('#F4F5F7')
HAIRLINE = HexColor('#E3E6EC')
GREEN = HexColor('#12A150')
AMBER = HexColor('#E8850C')
WHITE = HexColor('#FFFFFF')

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'docs', 'inversores')
LOGO = os.path.join(ROOT, 'assets', 'icon.png')

SLIDE = (960, 540)  # 16:9

REG = 'Helvetica'
BOLD = 'Helvetica-Bold'


def wrap(text, font, size, width):
    """Parte un texto en lineas que quepan en `width`."""
    words, lines, line = text.split(), [], ''
    for word in words:
        probe = word if not line else line + ' ' + word
        if stringWidth(probe, font, size) <= width:
            line = probe
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def paragraph(c, text, x, y, width, font=REG, size=13, leading=19, color=INK_2):
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


# --------------------------------------------------------------- pitch deck

def slide_chrome(c, page, total, kicker=None):
    """Pie comun: marca, numero y filete."""
    w, h = SLIDE
    c.setStrokeColor(HAIRLINE)
    c.setLineWidth(1)
    c.line(64, 62, w - 64, 62)
    c.setFont(REG, 9)
    c.setFillColor(INK_3)
    c.drawString(64, 44, 'Easy Parking')
    c.drawRightString(w - 64, 44, '%d / %d' % (page, total))
    if kicker:
        c.setFont(BOLD, 10)
        c.setFillColor(ACCENT)
        c.drawString(64, h - 68, kicker.upper())


def title_slide(c, total):
    w, h = SLIDE
    c.setFillColor(INK)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    if os.path.exists(LOGO):
        c.drawImage(ImageReader(LOGO), 64, h - 190, width=86, height=86,
                    mask='auto')

    c.setFont(BOLD, 62)
    c.setFillColor(WHITE)
    c.drawString(64, h - 300, 'Easy Parking')

    c.setFont(REG, 21)
    c.setFillColor(HexColor('#C9CDD6'))
    c.drawString(64, h - 340, 'El marketplace de parqueaderos de Bogota')

    c.setStrokeColor(HexColor('#2A2E38'))
    c.setLineWidth(1)
    c.line(64, h - 380, w - 64, h - 380)

    c.setFont(REG, 13)
    c.setFillColor(HexColor('#8C94A1'))
    c.drawString(64, h - 410, 'Ronda semilla  ·  USD 50.000 por 15%')
    c.drawString(64, h - 432, 'Bogota, Colombia')

    c.setFont(REG, 9)
    c.drawRightString(w - 64, 44, '%d / %d' % (1, total))


def bullet_slide(c, page, total, kicker, title, bullets, note=None):
    w, h = SLIDE
    c.setFillColor(WHITE)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    slide_chrome(c, page, total, kicker)

    c.setFont(BOLD, 38)
    c.setFillColor(INK)
    y = h - 130
    for line in wrap(title, BOLD, 38, w - 128):
        c.drawString(64, y, line)
        y -= 46

    y -= 24
    for head, body in bullets:
        c.setFont(BOLD, 15)
        c.setFillColor(INK)
        c.drawString(64, y, head)
        y -= 22
        y = paragraph(c, body, 64, y, w - 300, size=13, leading=19)
        y -= 22

    if note:
        c.setFont(REG, 11)
        c.setFillColor(INK_3)
        c.drawString(64, 90, note)


def statement_slide(c, page, total, kicker, big, support):
    w, h = SLIDE
    c.setFillColor(SURFACE)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    slide_chrome(c, page, total, kicker)

    c.setFont(BOLD, 44)
    c.setFillColor(INK)
    y = h - 200
    for line in wrap(big, BOLD, 44, w - 200):
        c.drawString(64, y, line)
        y -= 54

    y -= 16
    paragraph(c, support, 64, y, w - 260, size=14, leading=21)


def status_slide(c, page, total):
    """La diapositiva honesta: que hay y que falta, en dos columnas."""
    w, h = SLIDE
    c.setFillColor(WHITE)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    slide_chrome(c, page, total, 'Estado real')

    c.setFont(BOLD, 38)
    c.setFillColor(INK)
    c.drawString(64, h - 130, 'Que existe hoy, sin adornos')

    col = (w - 128 - 40) / 2

    hecho = [
        'App iOS y Android, 20 pantallas',
        'Flujo del conductor completo',
        'Flujo del propietario completo',
        'Mapa real de Google, estilo propio',
        'Base de datos: 9 tablas con RLS',
        'Reserva atomica: sin dobles cupos',
        'Busqueda por cercania con PostGIS',
    ]
    falta = [
        'Autenticacion: sin pantallas aun',
        'La app lee datos de ejemplo',
        'Pasarela de pagos sin integrar',
        'Cero usuarios',
        'Cero ingresos',
    ]

    def column(x, label, items, color, mark):
        c.setFont(BOLD, 12)
        c.setFillColor(color)
        c.drawString(x, h - 190, label.upper())
        y = h - 224
        c.setFont(REG, 14)
        for item in items:
            c.setFillColor(color)
            c.drawString(x, y, mark)
            c.setFillColor(INK_2)
            c.drawString(x + 20, y, item)
            y -= 26

    column(64, 'Construido', hecho, GREEN, '+')
    column(64 + col + 40, 'Falta', falta, AMBER, '-')

    c.setFont(REG, 12)
    c.setFillColor(INK_3)
    c.drawString(64, 90,
                 'La inversion es exactamente para cerrar la columna de la derecha.')


def deck():
    path = os.path.join(OUT, 'easy-parking-pitch-deck.pdf')
    c = canvas.Canvas(path, pagesize=SLIDE)
    c.setTitle('Easy Parking - Pitch Deck')
    c.setAuthor('Easy Parking')
    total = 12

    title_slide(c, total)
    c.showPage()

    bullet_slide(c, 2, total, 'El problema', 'Dos problemas que son el mismo', [
        ('El conductor no sabe si hay cupo hasta que llega',
         'Da vueltas a la manzana, compara precios de memoria y termina en el '
         'primero que encuentra. Buscar parqueadero es parte del trayecto.'),
        ('El propietario tiene espacio ocioso y ninguna forma de venderlo',
         'Garajes, lotes y parqueaderos pequenos pasan el dia vacios. Su unica '
         'herramienta comercial es un letrero en la reja.'),
    ])
    c.showPage()

    statement_slide(c, 3, total, 'La solucion',
                    'El inventario ya existe. Lo que falta es la forma de venderlo.',
                    'Easy Parking conecta las dos puntas: el conductor ve en el mapa que hay '
                    'cerca, a que precio y con cuantos cupos, y reserva antes de salir. El '
                    'propietario publica su espacio en ocho pasos y cobra por horas que hoy '
                    'no le producen nada.')
    c.showPage()

    bullet_slide(c, 4, total, 'Producto', 'Como funciona', [
        ('Para el conductor',
         'Un mapa donde el precio por hora se lee sobre cada parqueadero, para '
         'comparar sin abrir nada. Reserva con la tarifa congelada en el momento '
         'de reservar.'),
        ('Para el propietario',
         'Publicacion guiada en ocho pasos, una decision por pantalla, y un panel '
         'con sus ingresos y sus reservas.'),
        ('Pagos locales',
         'Nequi, Daviplata, PSE y tarjeta. Contemplados desde el diseno, no '
         'anadidos despues.'),
    ])
    c.showPage()

    bullet_slide(c, 5, total, 'Modelo', 'Como gana dinero', [
        ('Comision del 10% sobre cada reserva, con piso de 900 COP',
         'Ya esta implementada en la logica de precios: tramos de 30 minutos con '
         'minimo de una hora, y tope por tarifa diaria cuando el propietario la '
         'ofrece.'),
        ('Sin inventario propio y sin operacion fisica',
         'No compramos ni arrendamos parqueaderos. No hay costo por plaza, no hay '
         'CAPEX por ciudad. El margen no se come con operacion.'),
    ], note='La tarifa la pone el propietario. Nosotros cobramos por la transaccion.')
    c.showPage()

    status_slide(c, 6, total)
    c.showPage()

    statement_slide(c, 7, total, 'La defensa',
                    'Lo que se construye no es la app: es la red de propietarios.',
                    'El codigo se puede copiar en unos meses. Los acuerdos con cientos de '
                    'duenos de garajes en Bogota, no. Por eso el primer destino de la '
                    'inversion es el trabajo de calle, no mas desarrollo.')
    c.showPage()

    bullet_slide(c, 8, total, 'Mercado', 'La oportunidad', [
        ('Bogota concentra el mayor parque automotor del pais',
         'Y en las zonas de mayor actividad -Chapinero, Chico, Zona T, Usaquen- '
         'la escasez de parqueadero es diaria y conocida por cualquiera que '
         'maneje alli.'),
        ('La oferta esta fragmentada, y esa es la oportunidad',
         'Junto a los parqueaderos comerciales hay miles de garajes y lotes '
         'privados sin ninguna manera de comercializar sus horas ociosas. Esa '
         'capacidad ociosa es el inventario del negocio, y hoy no esta a la venta.'),
    ], note='PENDIENTE: cifras del RUNT y la Secretaria Distrital de Movilidad, '
            'y tarifa promedio levantada en campo. No se incluyen estimaciones sin fuente.')
    c.showPage()

    bullet_slide(c, 9, total, 'Plan', 'Los proximos 12 meses', [
        ('Meses 1-3  ·  Terminar el producto',
         'Autenticacion, conectar la app a la base de datos que ya esta disenada, '
         'e integrar la pasarela de pagos.'),
        ('Meses 3-6  ·  Los primeros propietarios',
         'Trabajo de calle en Chapinero, Chico y Usaquen. El objetivo no es '
         'volumen: es demostrar que un dueno de garaje firma.'),
        ('Meses 6-12  ·  Demanda y repeticion',
         'Primeras reservas, medir cuantas se repiten, y ajustar la comision '
         'con datos en vez de con suposiciones.'),
    ])
    c.showPage()

    bullet_slide(c, 10, total, 'Uso de los fondos', 'En que se gasta', [
        ('Dedicacion de tiempo completo del fundador',
         'Es la linea mas grande y la mas honesta: sin tiempo completo, esto '
         'avanza los fines de semana.'),
        ('Conseguir la oferta inicial',
         'Trabajo de campo con propietarios, e incentivos para los primeros que '
         'publiquen.'),
        ('Producto y operacion',
         'Ayuda puntual de desarrollo, infraestructura, constitucion de la '
         'sociedad y contabilidad.'),
    ], note='El detalle mes a mes esta en el modelo financiero que acompana a esta propuesta.')
    c.showPage()

    bullet_slide(c, 11, total, 'Equipo', 'Fundador unico', [
        ('Toda la aplicacion esta construida por una sola persona',
         'Los dos flujos, la interfaz, la integracion del mapa y la base de datos '
         'con sus reglas de seguridad y su logica de reservas.'),
        ('Por que eso importa',
         'El riesgo de ejecucion tecnica es bajo: lo que se promete no esta en una '
         'presentacion, esta construido y se puede abrir y probar.'),
        ('Lo que falta no es codigo',
         'Es calle. Por eso la inversion se destina a tiempo completo y a trabajo '
         'comercial, no a mas desarrollo.'),
    ])
    c.showPage()

    # Cierre
    w, h = SLIDE
    c.setFillColor(INK)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFont(BOLD, 12)
    c.setFillColor(ACCENT)
    c.drawString(64, h - 100, 'LA OFERTA')
    c.setFont(BOLD, 54)
    c.setFillColor(WHITE)
    c.drawString(64, h - 180, 'USD 50.000 por 15%')
    c.setFont(REG, 16)
    c.setFillColor(HexColor('#C9CDD6'))
    y = h - 230
    for line in ['Valoracion pre-money de USD 283.000.',
                 'Inversion minima por inversor: USD 5.000.',
                 'Abiertos a nota convertible si el inversor lo prefiere:',
                 'con el producto sin lanzar, aplazar la valoracion suele',
                 'convenirle a las dos partes.']:
        c.drawString(64, y, line)
        y -= 26
    c.setStrokeColor(HexColor('#2A2E38'))
    c.line(64, 130, w - 64, 130)
    c.setFont(REG, 12)
    c.setFillColor(HexColor('#8C94A1'))
    c.drawString(64, 104, 'Easy Parking  ·  Bogota, Colombia')
    c.setFont(REG, 9)
    c.drawRightString(w - 64, 44, '%d / %d' % (total, total))
    c.showPage()

    c.save()
    return path


# ------------------------------------------------------------ resumen ejecutivo

def executive_summary():
    path = os.path.join(OUT, 'easy-parking-resumen-ejecutivo.pdf')
    w, h = A4
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle('Easy Parking - Resumen ejecutivo')
    c.setAuthor('Easy Parking')

    m = 56
    inner = w - m * 2

    c.setFillColor(INK)
    c.rect(0, h - 132, w, 132, fill=1, stroke=0)
    if os.path.exists(LOGO):
        c.drawImage(ImageReader(LOGO), m, h - 104, width=48, height=48, mask='auto')
    c.setFont(BOLD, 26)
    c.setFillColor(WHITE)
    c.drawString(m + 64, h - 74, 'Easy Parking')
    c.setFont(REG, 12)
    c.setFillColor(HexColor('#8C94A1'))
    c.drawString(m + 64, h - 94, 'Resumen ejecutivo  ·  Bogota, Colombia')

    y = h - 176

    def section(title, body):
        nonlocal y
        c.setFont(BOLD, 11)
        c.setFillColor(ACCENT)
        c.drawString(m, y, title.upper())
        y -= 18
        y = paragraph(c, body, m, y, inner, size=10.5, leading=15.5)
        y -= 16

    section('El negocio',
            'Easy Parking es un marketplace de parqueaderos para Bogota, en aplicacion '
            'movil para iOS y Android. El conductor ve en el mapa que hay cerca, a que '
            'precio y con cuantos cupos, y reserva antes de salir. El propietario de un '
            'garaje, un lote o un parqueadero pequeno publica su espacio en ocho pasos y '
            'cobra por horas que hoy no le producen nada.')

    section('El problema',
            'Buscar donde parquear en Bogota es parte del trayecto: el conductor no sabe '
            'si hay cupo hasta que llega. Del otro lado, miles de espacios privados pasan '
            'el dia vacios porque su unica herramienta comercial es un letrero en la reja. '
            'El inventario ya existe en la ciudad; lo que falta es la forma de venderlo.')

    section('Modelo de ingresos',
            'Comision del 10% sobre cada reserva, con un piso de 900 COP, ya implementada '
            'en la logica de precios. No compramos ni operamos parqueaderos: no hay costo '
            'por plaza ni inversion de capital por ciudad.')

    section('Estado del producto',
            'Construido y funcionando como prototipo: aplicacion con los dos flujos '
            'completos, 20 pantallas, mapa real con estilo propio, y una base de datos '
            'disenada e implementada con seguridad por fila, reserva atomica y busqueda '
            'por cercania con indice espacial. Falta, dicho sin adornos: autenticacion, '
            'conectar la aplicacion a esa base, e integrar la pasarela de pagos. Hoy no '
            'hay usuarios ni ingresos.')

    section('Equipo',
            'Fundador unico. Toda la aplicacion esta construida por una sola persona, lo '
            'que hace que el riesgo de ejecucion tecnica sea bajo: lo que se promete se '
            'puede abrir y probar. Lo que sigue no es mas codigo, es trabajo de calle.')

    section('La oferta',
            'USD 50.000 por el 15% de participacion, equivalente a una valoracion '
            'pre-money de USD 283.000. Inversion minima por inversor: USD 5.000. Abiertos '
            'a estructurarlo como nota convertible. Los fondos se destinan a terminar el '
            'producto, conseguir la oferta inicial de parqueaderos en Bogota, y financiar '
            'la dedicacion de tiempo completo del fundador.')

    # Nota de honestidad al pie
    c.setFillColor(SURFACE)
    c.rect(m, 92, inner, 62, fill=1, stroke=0)
    c.setFont(BOLD, 9)
    c.setFillColor(INK)
    c.drawString(m + 16, 132, 'SOBRE LAS CIFRAS DE MERCADO')
    paragraph(c, 'Este documento no incluye estimaciones de tamano de mercado sin fuente. '
                 'Las cifras de parque automotor y de parqueaderos registrados se tomaran '
                 'del RUNT y de la Secretaria Distrital de Movilidad, y la tarifa promedio '
                 'de un levantamiento propio en campo.',
              m + 16, 118, inner - 32, size=8.5, leading=12, color=INK_2)

    c.setStrokeColor(HAIRLINE)
    c.line(m, 72, w - m, 72)
    c.setFont(REG, 8.5)
    c.setFillColor(INK_3)
    c.drawString(m, 56, 'Easy Parking  ·  Bogota, Colombia')
    c.drawRightString(w - m, 56, 'Documento para inversores')

    c.showPage()
    c.save()
    return path


# ----------------------------------------------------------- modelo financiero

# SUPUESTOS. Cambiarlos aqui y volver a generar.
TARIFA_HORA = 5000          # COP, promedio observado en los datos de referencia
HORAS_ESTANCIA = 3          # COP
COMISION = 0.10
PISO_COMISION = 900

# Mes a mes: parqueaderos activos y reservas por parqueadero al mes.
PARQUEADEROS = [0, 0, 5, 10, 20, 35, 50, 70, 90, 110, 130, 150]
RESERVAS_MES = [0, 0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]


def financial_model():
    path = os.path.join(OUT, 'easy-parking-modelo-financiero.pdf')
    w, h = A4
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle('Easy Parking - Modelo financiero')
    c.setAuthor('Easy Parking')

    m = 48
    inner = w - m * 2

    c.setFont(BOLD, 20)
    c.setFillColor(INK)
    c.drawString(m, h - 64, 'Modelo financiero')
    c.setFont(REG, 11)
    c.setFillColor(INK_2)
    c.drawString(m, h - 84, 'Easy Parking  ·  primeros 12 meses')

    # Aviso, arriba del todo y en rojo suave: esto son supuestos.
    c.setFillColor(HexColor('#FDF2E3'))
    c.rect(m, h - 168, inner, 62, fill=1, stroke=0)
    c.setFont(BOLD, 10)
    c.setFillColor(HexColor('#8A5200'))
    c.drawString(m + 14, h - 126, 'ESTO SON SUPUESTOS, NO PROYECCIONES VALIDADAS')
    paragraph(c, 'La empresa no tiene usuarios ni ingresos. Las cifras de abajo salen de '
                 'los supuestos declarados en esta misma pagina, no de datos historicos. '
                 'Sirven para mostrar la estructura del negocio y como se comporta, no para '
                 'prometer un resultado.',
              m + 14, h - 140, inner - 28, size=8.5, leading=11.5, color=HexColor('#7A4A00'))

    y = h - 200
    c.setFont(BOLD, 11)
    c.setFillColor(ACCENT)
    c.drawString(m, y, 'SUPUESTOS')
    y -= 20

    ticket = TARIFA_HORA * HORAS_ESTANCIA
    comision_unitaria = max(PISO_COMISION, round(ticket * COMISION))

    supuestos = [
        ('Tarifa promedio por hora', '%s COP' % f'{TARIFA_HORA:,}'.replace(',', '.')),
        ('Estancia promedio', '%d horas' % HORAS_ESTANCIA),
        ('Ticket promedio por reserva', '%s COP' % f'{ticket:,}'.replace(',', '.')),
        ('Comision', '%d%% con piso de %s COP' % (COMISION * 100,
                                                  f'{PISO_COMISION:,}'.replace(',', '.'))),
        ('Ingreso por reserva', '%s COP' % f'{comision_unitaria:,}'.replace(',', '.')),
    ]
    c.setFont(REG, 10)
    for label, value in supuestos:
        c.setFillColor(INK_2)
        c.drawString(m, y, label)
        c.setFillColor(INK)
        c.setFont(BOLD, 10)
        c.drawString(m + 240, y, value)
        c.setFont(REG, 10)
        y -= 17

    y -= 14
    c.setFont(BOLD, 11)
    c.setFillColor(ACCENT)
    c.drawString(m, y, 'ESCENARIO A 12 MESES')
    y -= 8

    # Tabla
    cols = [m, m + 60, m + 165, m + 265, m + 385]
    heads = ['Mes', 'Parqueaderos', 'Reservas', 'GMV (COP)', 'Ingresos (COP)']
    y -= 18
    c.setFillColor(SURFACE)
    c.rect(m, y - 6, inner, 20, fill=1, stroke=0)
    c.setFont(BOLD, 9)
    c.setFillColor(INK)
    for x, head in zip(cols, heads):
        c.drawString(x + 6, y, head)
    y -= 22

    total_reservas = total_gmv = total_ing = 0
    c.setFont(REG, 9.5)
    for i in range(12):
        parks = PARQUEADEROS[i]
        reservas = parks * RESERVAS_MES[i]
        gmv = reservas * ticket
        ingresos = reservas * comision_unitaria
        total_reservas += reservas
        total_gmv += gmv
        total_ing += ingresos

        if i % 2 == 1:
            c.setFillColor(HexColor('#FAFBFC'))
            c.rect(m, y - 5, inner, 17, fill=1, stroke=0)

        c.setFillColor(INK_2)
        values = [str(i + 1), str(parks), f'{reservas:,}'.replace(',', '.'),
                  f'{gmv:,}'.replace(',', '.'), f'{ingresos:,}'.replace(',', '.')]
        for x, value in zip(cols, values):
            c.drawString(x + 6, y, value)
        y -= 17

    c.setStrokeColor(HAIRLINE)
    c.line(m, y + 8, w - m, y + 8)
    y -= 6
    c.setFont(BOLD, 9.5)
    c.setFillColor(INK)
    totals = ['Total', '', f'{total_reservas:,}'.replace(',', '.'),
              f'{total_gmv:,}'.replace(',', '.'), f'{total_ing:,}'.replace(',', '.')]
    for x, value in zip(cols, totals):
        c.drawString(x + 6, y, value)

    y -= 34
    c.setFont(BOLD, 11)
    c.setFillColor(ACCENT)
    c.drawString(m, y, 'LO QUE ESTE MODELO NO DICE')
    y -= 20
    y = paragraph(c,
                  'No incluye costo de adquisicion de propietarios ni de conductores, porque '
                  'todavia no se ha medido ninguno de los dos. Ese es precisamente el numero '
                  'que los primeros meses de operacion tienen que averiguar, y hasta que se '
                  'mida, cualquier cifra aqui seria inventada.',
                  m, y, inner, size=10, leading=15)

    y -= 10
    y = paragraph(c,
                  'Tampoco asume ingresos en los dos primeros meses: ese tiempo se va en '
                  'terminar el producto y en firmar los primeros parqueaderos.',
                  m, y, inner, size=10, leading=15)

    c.setStrokeColor(HAIRLINE)
    c.line(m, 56, w - m, 56)
    c.setFont(REG, 8.5)
    c.setFillColor(INK_3)
    c.drawString(m, 40, 'Easy Parking  ·  Modelo generado por scripts/generate-investor-pdfs.py')

    c.showPage()
    c.save()
    return path


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for build in (deck, executive_summary, financial_model):
        created = build()
        size = os.path.getsize(created) / 1024
        print('  %-46s %6.1f KB' % (os.path.basename(created), size))
    print('\nListo en docs/inversores/')
