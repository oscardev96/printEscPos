import { View, Text, Platform, NativeEventEmitter, DeviceEventEmitter, Pressable, FlatList, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BluetoothManager, BluetoothEscposPrinter, BluetoothTscPrinter } from 'react-native-bluetooth-escpos-printer';
import AsyncStorage from '@react-native-async-storage/async-storage';
const dsDichVu = [
   {
      nhom_dich_vu: "MIEN DICH",
      dich_vu : [
        { ten_dich_vu: "Hoa sinh", price: "35,0000" },
        { ten_dich_vu: "Creatinin mau", price: "35,0000" },
        { ten_dich_vu: "Tong phan tich nuoc tieu 11TS", price: "40,0000" }
      ]
    },
    {
      nhom_dich_vu: "VI KY SINH",
      dich_vu : [
        { ten_dich_vu: "Soi dich am dao", price: "35,0000" },
        { ten_dich_vu: " Thuy dau IgG", price: "35,0000" },
        { ten_dich_vu: "Soi nam(vi nam soi tuoi)", price: "40,0000" }
      ]
    },
    {
      nhom_dich_vu: "HOA SINH",
      dich_vu : [
        { ten_dich_vu: "Hoa sinh", price: "35,0000" },
        { ten_dich_vu: "Creatinin mau", price: "35,0000" },
        { ten_dich_vu: "Tong phan tich nuoc tieu 11TS", price: "40,0000" },
        { ten_dich_vu: "Hoa sinh", price: "35,0000" },
        { ten_dich_vu: "Creatinin mau", price: "35,0000" },
        { ten_dich_vu: "Tong phan tich nuoc tieu 11TS", price: "40,0000" }
      ]
    },
]

const KEY_DEVICES = "KEY_DEVICES"

export default function App() {
  var _listeners = []
  const [loading, setLoading] = useState(false)
  const [isEnable, setIsEnable] = useState(false) // biến check xem đã bật đơn thuốc chưa
  const [listPaired, setListPaired] = useState([]) // danh sách đã kết nối
  const [listFound, setListFound] = useState([]) // danh sách tìm thấy
  const [connectedAddress, setConnectedAddress] = useState() // địa chỉ đã kết nối


  useEffect(() => {
    checkBluetooth()
  }, [])

  useEffect(() => {
    if (isEnable) {
      //scanDevices()
    }
  }, [isEnable])



  function checkBluetooth() {
    BluetoothManager.isBluetoothEnabled().then((enabled) => {
      console.log("CHECK BAT HAY CHUA", enabled)
      setIsEnable(Boolean(enabled))
    }, (err) => {
      console.log(err)
    });

    // mỗi lần lắng nghe là quét 1 thiết bị
    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      _listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        (rsp) => {
          console.log("EVENT_DEVICE_ALREADY_PAIRED", rsp)
        }));
      _listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
        console.log("EVENT_DEVICE_FOUND", rsp)
      }));
      _listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
        console.log("EVENT_CONNECTION_LOST",)

      }));
    } else if (Platform.OS === 'android') {
      _listeners.push(DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp) => {
          console.log("EVENT_DEVICE_ALREADY_PAIRED", rsp)
        }));
      _listeners.push(DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
          console.log("EVENT_DEVICE_FOUND", rsp)
        }));
      _listeners.push(DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_CONNECTION_LOST, () => {
          console.log("EVENT_CONNECTION_LOST", )

        }
      ));
      _listeners.push(DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, () => {
          console.log("EVENT_BLUETOOTH_NOT_SUPPORT", )
        }
      ))
    }

  }

  // quét thiết bị
  async function scanDevices() {
    BluetoothManager.scanDevices()
      .then((response) => {
        var list = JSON.parse(response);//JSON string
        setListFound(list.found)
        setListPaired(list.paired)

      }, (er) => {

        console.log('SCAN error' + JSON.stringify(er));
      });
  }

  

  // kết nối vào 1 thiết bị
  async function connectDevices(address) {
    console.log("connecccct address", address)
    try {
      const res = await BluetoothManager.connect(address)
      
        console.log("connect success", address)
        setConnectedAddress(address)
      
    } catch (error) {
      console.log("ConnectFail", error)
    }
  }

  async function disableBluetooth(){
      try {
        let res = await BluetoothManager.disableBluetooth()
        if (res) {
          setListFound([])
          setListPaired([])
          setConnectedAddress()
        }
      } catch (error) {
        console.log(" disableBluetooth errror", error)
      }
  }

  async function enableBluetooth () {
    try {
        let res = await BluetoothManager.enableBluetooth()
        if (res) {
          let list = res.map(item => JSON.parse(item))
          setListPaired(list)
        }
    } catch (error) {
      console.log(" enableBluetooth errror", error)
    }
  }


  async function printBill() {
    //fonttype font chữ to hay bé
    //widthtimes chiểu rộng chữ
    //heigthtimes:2, chiều cao chữ

    
    try {
      await BluetoothEscposPrinter.printText("\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printText("TRUNG TAM XET NGHIEM \n GENMEDIC\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText("Phieu chi dinh va thu tien \r\ntai nha\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText("==========================\r\n", {});
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.setBlob(1);
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText("In hoa don：1108\r\n\r\n\r\n", {});
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.printText("Ngay : 27/02/2022\r\n", {});
      await BluetoothEscposPrinter.printText("Ho ten : NGUYEN VAN TIEN\r\n", {});
      await BluetoothEscposPrinter.printText("Dia chi: Ha Noi\r\n", {});
      await BluetoothEscposPrinter.printText("So dien thoai : 098827272727\r\n", {});
      await BluetoothEscposPrinter.printText("Ten dang nhap : 123" + "\r\n", {});
      await BluetoothEscposPrinter.printText("Mat khau : 4119\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText("==========================\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText("Cac d/v dang ky : (DTV - \r\nnghin dong)\r\n", {});
      for (let i = 0; i < dsDichVu.length; i++) {
        const item = dsDichVu[i];
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.setBlob(1);
        await BluetoothEscposPrinter.printText(`${i + 1}  ${item.nhom_dich_vu} \r\n`, {fonttype: 2, widthtimes:0.5});
        await BluetoothEscposPrinter.setBlob(0);
        for (let j = 0; j < item.dich_vu.length; j++) {
          const element =  item.dich_vu[j];
          await BluetoothEscposPrinter.printText(`${j + 1}  ${element.ten_dich_vu}(${element.price}) \r\n`, {});
          
        }
      }
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText("==========================\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      let columnWidths = [16,16];
      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["Tong dich vu :", "110,000"],
        {}
      )
      await BluetoothEscposPrinter.printText("\r\n", {});

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["So tien giam :", "20,000"],
        {}
      )
      await BluetoothEscposPrinter.printText("\r\n", {});

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["Tien di lai :", "20,000"],
        {}
      )

      await BluetoothEscposPrinter.printText("\r\n", {});

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ["Tong cuoi :", "20,000"],
        {}
      )
      await BluetoothEscposPrinter.printText("\r\n", {});
      await BluetoothEscposPrinter.printText("Bang chu : Mot tram muoi nghin dong chan \r\n", {codepage : 10});
      await BluetoothEscposPrinter.printText("(Ngoai cac khoan tren khach hang khong phai tra them bat ky chi phi nao) \r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText("==========================\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText("Toi dong y lam cac xet \r\nnghiem tren  \r\n", {})
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      // await BluetoothEscposPrinter.printText("...........................\r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText(".  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printText(".  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printText(".  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printText(".  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printText(".  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText(".................\r\n\r\n",  {widthtimes: 1,heigthtimes: 1,fonttype: 2});
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.setBlob(1);
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText("NGUYEN VAN TIEN\r\n\r\n", { widthtimes:0.5,fonttype: 2.5, });
      await BluetoothEscposPrinter.setBlob(0);
      

      
      await BluetoothEscposPrinter.printText("Toi dong y nhan ket qua xet nghiem bang tin nhan, website,\r\n ban tra cuu ket qua them tren \r\nweb, email   \r\n", {});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      await BluetoothEscposPrinter.printText("..................\r\n\r\n",  {widthtimes: 1,heigthtimes: 1,fonttype: 1.5});
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.setBlob(1);
      await BluetoothEscposPrinter.printText("Nguoi lay mau : TUGN  \r\n", { widthtimes:0.5,fonttype: 2.5});
      await BluetoothEscposPrinter.printText("TG In : 15:34 10/03/2022  \r\n", { fonttype: 1.5});
      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n\r\n\r\n\r\n", {});

    } catch (e) {
      alert(e.message || "ERROR")
    }

  }

  console.log("ĐÃ tìm thấy", listFound)
  console.log("Đã kết nối", listPaired)

  return (
    <View style={{ justifyContent: "center", alignItems: "center", flex: 1, paddingBottom: 20 }}>
      <View style={{flexDirection:"row", justifyContent:"space-around"}}>
        <Pressable
          style={styles.button}
          onPress={disableBluetooth}
        >
          <Text>Tắt bluetooth</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={enableBluetooth}
        >
          <Text>Bật bluetooth</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={scanDevices}
        >
          <Text>Scan</Text>
        </Pressable>
        
        <Pressable onPress={() => {
          if (!!connectedAddress) {
            printBill()
          }else{
            alert("Chưa kết nối máy in")
          }
        }}

          style={{...styles.button, backgroundColor:"red"}}>
          <Text>Print Text</Text>
        </Pressable>
      </View>
      <ScrollView>
        <Text>Tìm thấy</Text>
        <FlatList
          data={listFound}
          numColumns={3}
          renderItem={({ item, index }) => (
            item.name ? <Pressable style={{ margin: 10, borderColor: "gray", padding: 20, backgroundColor: "#3222" }}
              onPress={() => connectDevices(item.address)}
            >
              <Text>{item.name}</Text>
            </Pressable> : null
          )}
          keyExtractor={(item, index) => index.toString()}

        />
        <Text>Đã kết nối</Text>
        <FlatList
          data={listPaired}
          numColumns={3}
          renderItem={({ item, index }) => (
            <Pressable style={{ margin: 10, borderColor: "gray", padding: 20, backgroundColor: "#3222" }}
              onPress={() => connectDevices(item.address)}

            >
              <Text>{item.name ? item.name : "UNKNOW"}</Text>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}

        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 50,
    backgroundColor: "green",
    marginTop: 20,
    marginHorizontal:10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20
  }
})