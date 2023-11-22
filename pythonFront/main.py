import json

from guizero import App, TextBox, PushButton, Text
from matplotlib import pyplot as plt
from matplotlib.figure import Figure
from matplotlib import dates as mdates  # Agrega esta línea
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import tkinter as tk
import paho.mqtt.client as mqtt
from datetime import datetime


broker = "44.216.84.214"
client = mqtt.Client("Pirulo")
client.connect(broker, 1883)

app = App("Control de Inventario", width=500, height=300, layout="grid", bg="#f0f0f0")

# Global variable for nuevo_prod
nuevo_prod = ""
client.subscribe("AustralFI/inel15/receive/getHistory")
client.subscribe("AustralFI/inel15/receive/buy")
client.subscribe("AustralFI/inel15/receive/repose")
inventario = Text(app, text="", grid=[0, 4, 2, 1])
inventario_aux = 0


# Definiciones de función para los eventos
def btn_reponer_stock():
    global nuevo_prod
    global inventario_aux
    client.publish("AustralFI/inel15/repose/Pepito", nuevo_prod)
    inventario.value = f"Stock Pepito: {inventario_aux + int(nuevo_prod)}"
    inventario_aux += int(nuevo_prod)
    nuevo_prod = ""


def actualizar_prod(value):
    global nuevo_prod
    nuevo_prod += value


def btn_clear():
    global nuevo_prod
    nuevo_prod = ""
    label_input.value = ""


def btn_see_history():
    print("si")
    client.publish("AustralFI/inel15/getHistory/Pepito")


# Function to handle MQTT messages
def on_message(client, userdata, message):
    print(message.topic)
    if message.topic == "AustralFI/inel15/receive/buy" or message.topic == "AustralFI/inel15/receive/buy":
        global inventario_aux
        if inventario_aux > 0:
            inventario_aux = inventario_aux - 1
            inventario.value = f"Stock Pepito: {inventario_aux}"
    if message.topic == "AustralFI/inel15/receive/getHistory":
        payload = message.payload.decode("utf-8")
        data_objects = json.loads(payload)
        last_object = data_objects[-1]
        print(last_object)
        if last_object.get("old_qty") is None:
            return
        old_qty_value = int(last_object.get('old_qty') + last_object.get("update_qty"))
        inventario_aux = old_qty_value
        inventario.value = f"Stock Pepito: {inventario_aux}"
        update_chart(payload)


def update_chart(data):
    data_objects = json.loads(data)

    # Convertir las fechas al formato adecuado
    time_values = [datetime.strptime(obj["date"], "%Y-%m-%dT%H:%M:%S.%fZ") for obj in data_objects]
    data_values = [obj["old_qty"] for obj in data_objects]

    # Limpiar el gráfico antes de agregar nuevos datos
    chart.clear()

    # Plotear los datos en el gráfico
    chart.plot(time_values, data_values, marker='o', linestyle='-', markersize=1)

    # Configurar etiquetas y título del gráfico
    chart.set_xlabel("Tiempo")
    chart.set_ylabel("Valor")
    chart.set_title("Historial de Estadísticas")

    # Formatear las etiquetas del eje x para que sean legibles
    chart.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))

    # Rotar las etiquetas para mejorar la legibilidad
    plt.xticks(rotation=45)

    # Actualizar el widget del lienzo
    canvas.draw()


# GUI widgets
btn_reponer = PushButton(app, command=btn_reponer_stock, text="Reponer", grid=[1, 2], width=15, pady=10)
label_input = TextBox(app, command=actualizar_prod, grid=[0, 2], width=15)
btn_clear = PushButton(app, command=btn_clear, text="Limpiar", grid=[2, 2], width=15, pady=10)
btn_see_history = PushButton(app, command=btn_see_history, text="Ver Historial", grid=[3, 2], width=15, pady=10)

# Crear una nueva ventana para el lienzo del gráfico
chart_window = tk.Toplevel(app.tk)
chart_window.title("Gráfico")
chart_window.geometry("600x400")

# Crear el lienzo del gráfico en la nueva ventana
figure = Figure(figsize=(5, 4), dpi=100)
chart = figure.add_subplot(1, 1, 1)
chart.set_title("Historial de Estadísticas")

canvas = FigureCanvasTkAgg(figure, master=chart_window)
canvas_widget = canvas.get_tk_widget()
canvas_widget.pack()

# Aplicar estilos
app.bg = "#f0f0f0"  # Fondo gris claro
btn_reponer.bg = "#4CAF50"  # Verde para el botón de reponer
btn_reponer.text_color = "white"
btn_clear.bg = "#FF0000"  # Rojo para el botón de limpiar
btn_clear.text_color = "white"
btn_see_history.bg = "#696969"  # Gris oscuro para el botón de historial

btn_see_history.text_color = "white"
if 0 < int(inventario_aux) <= 3:
    inventario.text_color = "red"
if 3 < int(inventario_aux) <= 5:
    inventario.text_color = "yellow"
else:
    inventario.text_color = "green"

client.on_message = on_message
client.loop_start()

# Mostrar GUI en la pantalla
app.display()
