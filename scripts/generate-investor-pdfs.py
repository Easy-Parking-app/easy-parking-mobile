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


# ------------------------------------------------------------ plan de negocio

class Flow:
    """Texto que fluye y salta de pagina solo."""

    def __init__(self, c, w, h, margin=56):
        self.c, self.w, self.h, self.m = c, w, h, margin
        self.inner = w - margin * 2
        self.y = h - 96
        self.page = 1

    def _footer(self):
        c = self.c
        c.setStrokeColor(HAIRLINE)
        c.setLineWidth(1)
        c.line(self.m, 62, self.w - self.m, 62)
        c.setFont(REG, 8.5)
        c.setFillColor(INK_3)
        c.drawString(self.m, 46, 'Easy Parking  ·  Plan de negocio')
        c.drawRightString(self.w - self.m, 46, str(self.page))

    def need(self, space):
        if self.y - space < 84:
            self._footer()
            self.c.showPage()
            self.page += 1
            self.y = self.h - 72

    def heading(self, text):
        self.need(70)
        self.c.setFont(BOLD, 13)
        self.c.setFillColor(INK)
        self.c.drawString(self.m, self.y, text)
        self.y -= 9
        self.c.setStrokeColor(ACCENT)
        self.c.setLineWidth(2)
        self.c.line(self.m, self.y, self.m + 26, self.y)
        self.y -= 22

    def body(self, text, size=10, leading=15, color=INK_2, font=REG):
        for line in wrap(text, font, size, self.inner):
            self.need(leading)
            self.c.setFont(font, size)
            self.c.setFillColor(color)
            self.c.drawString(self.m, self.y, line)
            self.y -= leading
        self.y -= 7

    def item(self, head, text):
        self.need(50)
        self.c.setFont(BOLD, 10)
        self.c.setFillColor(INK)
        self.c.drawString(self.m, self.y, head)
        self.y -= 15
        self.body(text)

    def close(self):
        self._footer()


def business_plan():
    path = os.path.join(OUT, 'easy-parking-plan-de-negocio.pdf')
    w, h = A4
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle('Easy Parking - Plan de negocio')
    c.setAuthor('Easy Parking')

    c.setFillColor(INK)
    c.rect(0, h - 116, w, 116, fill=1, stroke=0)
    if os.path.exists(LOGO):
        c.drawImage(ImageReader(LOGO), 56, h - 92, width=42, height=42, mask='auto')
    c.setFont(BOLD, 22)
    c.setFillColor(WHITE)
    c.drawString(112, h - 68, 'Plan de negocio')
    c.setFont(REG, 11)
    c.setFillColor(HexColor('#8C94A1'))
    c.drawString(112, h - 87, 'Easy Parking  ·  Bogota, Colombia')

    f = Flow(c, w, h)
    f.y = h - 152

    f.heading('1. Que es Easy Parking')
    f.body('Un marketplace de parqueaderos para Bogota, en aplicacion movil para iOS y '
           'Android. Conecta a quien necesita donde dejar el carro con quien tiene un '
           'espacio parado: garajes, lotes y parqueaderos pequenos que hoy no tienen '
           'ninguna forma de vender sus horas ociosas.')
    f.body('El conductor ve en el mapa que hay cerca, a que precio y con cuantos cupos, y '
           'reserva antes de salir. El propietario publica su espacio en ocho pasos y cobra '
           'por horas que hoy no le producen nada. Nosotros cobramos comision por reserva.')

    f.heading('2. El problema')
    f.item('Del lado del conductor',
           'No sabe si hay cupo hasta que llega. Da vueltas a la manzana, compara precios de '
           'memoria y termina en el primero que encuentra. En las zonas de mayor actividad '
           '-Chapinero, Chico, Zona T, Usaquen- buscar parqueadero es parte del trayecto.')
    f.item('Del lado del propietario',
           'Un garaje privado, un lote o un parqueadero de pocas plazas tiene capacidad '
           'ociosa casi todo el dia. Su unica herramienta comercial es un letrero en la reja, '
           'y cobrarle a un desconocido implica un riesgo que la mayoria prefiere no correr.')

    f.heading('3. La solucion y el producto')
    f.item('Precio visible sobre el mapa',
           'No un pin generico: la tarifa por hora se lee directamente encima de cada '
           'parqueadero, para poder comparar sin abrir nada. Es la decision de producto que '
           'mas diferencia la pantalla principal.')
    f.item('Reserva con tarifa congelada',
           'El precio se fija al reservar. Si el propietario sube la tarifa manana, el recibo '
           'de ayer no cambia.')
    f.item('Publicacion guiada en ocho pasos',
           'Una decision por pantalla. Publicar no puede sentirse como un tramite, porque el '
           'propietario es la parte dificil de conseguir.')
    f.item('Pagos locales desde el diseno',
           'Nequi, Daviplata, PSE y tarjeta, contemplados en el modelo desde el principio.')

    f.heading('4. Estado del producto')
    f.body('Construido y funcionando como prototipo: aplicacion con los dos flujos completos, '
           '20 pantallas, mapa real con estilo propio, y una base de datos disenada e '
           'implementada con seguridad por fila, reserva atomica -dos personas no pueden '
           'llevarse el mismo cupo- y busqueda por cercania con indice espacial.')
    f.body('Falta, dicho sin adornos: autenticacion, conectar la aplicacion a esa base de '
           'datos, e integrar la pasarela de pagos. Hoy no hay usuarios ni ingresos. La '
           'inversion es precisamente para cerrar ese tramo.')

    f.heading('5. Modelo de negocio')
    f.body('Comision del 10% sobre cada reserva, con piso de 900 COP, ya implementada en la '
           'logica de precios: tramos de 30 minutos con minimo de una hora, y tope por tarifa '
           'diaria cuando el propietario la ofrece. La tarifa la pone el propietario.')
    f.body('No compramos ni operamos parqueaderos. No hay costo por plaza ni inversion de '
           'capital por ciudad, asi que el margen no se consume en operacion. Los supuestos y '
           'el escenario a doce meses estan en el modelo financiero que acompana a este plan.')

    f.heading('6. Mercado')
    f.body('Bogota concentra el mayor parque automotor del pais y una escasez de parqueadero '
           'conocida por cualquiera que maneje en la ciudad. La oferta esta fragmentada: '
           'junto a los parqueaderos comerciales hay miles de espacios privados sin ninguna '
           'manera de comercializarse. Esa capacidad ociosa es el inventario del negocio.')
    f.body('PENDIENTE ANTES DE PUBLICAR: cifras de parque automotor y de parqueaderos '
           'registrados, del RUNT y de la Secretaria Distrital de Movilidad, y tarifa promedio '
           'levantada en campo. El tamano de mercado se construira de abajo hacia arriba '
           '-cupos por ocupacion por tarifa- y no copiando un informe global.', color=AMBER)

    f.heading('7. Competencia')
    f.body('El espacio no esta vacio, y conviene decirlo antes de que lo diga el inversor. En '
           'Bogota ya operan, entre otros:')
    f.item('RentaParking (desde 2016)',
           'El mas parecido: publicar, descubrir y reservar espacios, con alquiler por horas, '
           'noches, semanas o mensualidades.')
    f.item('NIDOO',
           'Plataforma para encontrar, reservar y pagar estacionamiento publico o privado.')
    f.item('Parkcero',
           'Reserva por minutos, horas, dias o semanas, con enfasis en precio.')
    f.item('Zona de Parqueo Pago (Distrito)',
           'La aplicacion oficial de parqueo en via, con mas de 5.000 cupos. No compite en '
           'fuera de via, pero si por el mismo momento de decision del conductor.')
    f.item('MotoPass',
           'Especializado en motos, con planes y suscripciones.')
    f.body('Que significa esto. Que la tesis ya esta validada por otros: hay demanda y hay '
           'oferta dispuesta a digitalizarse. Y tambien que no vamos a ganar por ser los '
           'primeros, porque no lo somos.')
    f.body('Donde puede estar la diferencia, dicho con prudencia: en comparar precio sin '
           'friccion sobre el mapa, en hacer que publicar sea lo bastante facil como para '
           'atraer al garaje particular -la punta larga de la oferta, no los parqueaderos '
           'comerciales que ya estan en las otras plataformas- y en la ejecucion comercial. '
           'En un marketplace con competidores establecidos la ventaja no es una '
           'funcionalidad: es la densidad de oferta en las manzanas donde el conductor busca.')

    f.heading('8. Estrategia de entrada')
    f.item('Concentracion geografica antes que cobertura',
           'Empezar por dos o tres barrios -Chapinero y Chico- hasta tener densidad suficiente '
           'para que abrir la app siempre devuelva algo util. Cien parqueaderos repartidos por '
           'toda la ciudad no sirven; veinte en cuatro manzanas si.')
    f.item('La oferta primero',
           'Sin parqueaderos publicados no hay nada que ensenarle a un conductor. El primer '
           'trabajo es de calle: tocar puertas de garajes y edificios.')
    f.item('Comision reducida para los primeros',
           'Un incentivo de entrada para los propietarios fundadores. Cuesta margen, no caja, '
           'y compra la densidad inicial.')

    f.heading('9. Riesgos')
    f.item('Arranque en frio del marketplace',
           'Sin oferta no hay demanda y sin demanda no hay oferta. Se mitiga con concentracion '
           'geografica e incentivos a los primeros propietarios, no con publicidad.')
    f.item('Competidores con ventaja de tiempo',
           'RentaParking lleva anos. Si ya resolvieron la densidad de oferta en las zonas '
           'buenas, entrar cuesta mas. Hay que medirlo en campo antes de gastar.')
    f.item('Fundador unico',
           'Es el riesgo que mas senala cualquier inversor, y es real. La contrapartida es que '
           'el producto ya esta construido: el riesgo de ejecucion tecnica es bajo.')
    f.item('Confianza y responsabilidad',
           'Que pasa si danan un carro dentro de un garaje particular. Se resuelve con '
           'terminos claros y, llegado el volumen, con un seguro. No esta resuelto todavia.')

    f.heading('10. Equipo')
    f.body('Fundador unico. Toda la aplicacion -los dos flujos, la interfaz, la integracion '
           'del mapa y la base de datos con sus reglas de seguridad y su logica de reservas- '
           'esta construida por una sola persona. Lo que sigue no es mas codigo, es trabajo '
           'de calle, y por eso el primer destino de la inversion es la dedicacion de tiempo '
           'completo.')

    f.heading('11. La ronda')
    f.body('USD 50.000 por el 15% de participacion, equivalente a una valoracion pre-money de '
           'USD 283.000. Inversion minima por inversor: USD 5.000. Abiertos a estructurarlo '
           'como nota convertible: con el producto sin lanzar, aplazar la discusion de '
           'valoracion suele convenirle a las dos partes.')
    f.item('Destino de los fondos',
           'Dedicacion de tiempo completo del fundador; terminar el producto -autenticacion, '
           'backend y pasarela de pagos-; conseguir la oferta inicial en Bogota; e '
           'infraestructura, constitucion de la sociedad y contabilidad.')

    f.heading('12. Constitucion')
    f.body('La sociedad todavia no existe. En Colombia la SAS unipersonal permite un unico '
           'accionista que a la vez es representante legal, con registro en la Camara de '
           'Comercio y RUT ante la DIAN. El impuesto de registro es un porcentaje del capital '
           'declarado, de modo que un capital inicial bajo mantiene el tramite economico. Es '
           'condicion previa a recibir cualquier inversion.')

    f.close()
    c.showPage()
    c.save()
    return path


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for build in (deck, executive_summary, financial_model, business_plan):
        created = build()
        size = os.path.getsize(created) / 1024
        print('  %-46s %6.1f KB' % (os.path.basename(created), size))
    print('\nListo en docs/inversores/')
