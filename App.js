import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {Picker} from '@react-native-picker/picker';
import {ColorPicker} from 'react-native-color-picker';
import tinycolor from 'tinycolor2';
import Modal from 'react-native-modal';

const ArrowButton = ({text, onPress}) => (
  <TouchableOpacity style={styles.arrowButton} onPress={onPress}>
    <Text style={styles.arrowButtonText}>{text}</Text>
  </TouchableOpacity>
);

const App = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [selectedValue, setSelectedValue] = useState(10);
  const [modelVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');

  useEffect(() => {
    const fetchPairedDevices = async () => {
      try {
        const pairedDevices = await RNBluetoothClassic.getBondedDevices();
        console.log('pairedDevices', pairedDevices);
        setDevices(pairedDevices);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPairedDevices();
  }, []);

  const connectToDevice = async device => {
    try {
      const connection = await RNBluetoothClassic.connectToDevice(
        device.address,
      );
      setConnectedDevice(connection);
      console.log('Connected to', device.name);
    } catch (error) {
      console.error('Connection failed', error);
    }
  };

  const sendData = async data => {
    if (connectedDevice) {
      try {
        await connectedDevice.write(data);
        console.log('Data sent', data);
      } catch (error) {
        console.error('Failed to send data', error);
      }
    }
  };

  const handleOpenPicker = () => {
    setModalVisible(true);
  };

  const handleColorSelection = () => {
    setModalVisible(false);
    console.log('handleCOlorselection');
  };

  const handleColorSelected = color => {
    console.log('handleColorSelected');
    const hexColor = tinycolor(color).toHexString();
    setSelectedColor(hexColor);
    console.log(selectedColor);
  };

  return (
    <View>
      {!connectedDevice && (
        <FlatList
          data={devices}
          keyExtractor={item => item.address}
          renderItem={({item}) => (
            <Button title={item.name} onPress={() => connectToDevice(item)} />
          )}
        />
      )}
      {connectedDevice && (
        <View>
          <Text>Connected to {connectedDevice.name}</Text>
        </View>
      )}

      <View style={styles.section1}>
        <Text style={styles.label}>Stepper motor control</Text>
        <View style={styles.degreesContainer}>
          <Picker
            selectedValue={selectedValue}
            style={styles.picker}
            onValueChange={itemValue => setSelectedValue(itemValue)}>
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="30" value="30" />
            <Picker.Item label="40" value="40" />
            <Picker.Item label="45" value="45" />
            <Picker.Item label="60" value="60" />
            <Picker.Item label="90" value="90" />
            <Picker.Item label="180" value="180" />
          </Picker>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => sendData(`d=${selectedValue}`)}>
            <Text style={styles.buttonText}>Set degree</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section2}>
        <Text style={styles.label}>LED light panel control</Text>
        <View style={styles.colorContainer}>
          <TouchableOpacity
            style={styles.colorButton}
            onPress={() => handleOpenPicker('Hello Arduino')}>
            <Text style={styles.buttonText}>Select Color</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => sendData(`c=${selectedColor}`)}>
            <Text style={styles.buttonText}>Set color</Text>
          </TouchableOpacity>
        </View>
        <Modal isVisible={modelVisible}>
          <View style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              <ColorPicker
                onColorChange={color => handleColorSelected(color)}
                style={styles.colorPicker}
              />
            </View>
            <TouchableOpacity
              style={styles.colorButton}
              onPress={() => handleColorSelection()}>
              <Text style={styles.buttonText}>Select color</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

      <View style={styles.section3}>
        <Text style={styles.label}>Camera stand control</Text>

        <View style={styles.arrowContainer}>
          <View style={styles.row}>
            <ArrowButton text="↑" onPress={() => sendData('m=up')} />
          </View>
          <View style={styles.row}>
            <ArrowButton text="←" onPress={() => sendData('m=left')} />
            <ArrowButton text="→" onPress={() => sendData('m=right')} />
          </View>
          <View style={styles.row}>
            <ArrowButton text="↓" onPress={() => sendData('m=down')} />
          </View>
        </View>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: 'black',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  degreesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  picker: {
    width: 120,
    height: 50,
    marginRight: 10,
  },
  startButton: {
    backgroundColor: '#033240',
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  colorButton: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 5,
    width: 150,
    alignItems: 'center',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerContainer: {
    height: '65%',
    width: '100%',
    marginBottom: 10,
    alignSelf: 'center',
  },
  colorPicker: {
    flex: 1,
  },
  section0: {
    backgroundColor: '#ffffff',
    height: '45%',
  },
  section1: {
    backgroundColor: '#E0F8E0',
    marginBottom: 2,
    padding: 5,
  },
  section2: {
    backgroundColor: '#E0F0F8',
    marginBottom: 2,
    padding: 5,
  },
  section3: {
    backgroundColor: '#F0F0F0',
    marginBottom: 2,
    padding: 5,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  arrowButton: {
    backgroundColor: '#033240',
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 1,
    marginHorizontal: 5,
  },
  arrowButtonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
