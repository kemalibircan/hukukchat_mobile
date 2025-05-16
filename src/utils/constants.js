import { Platform } from "react-native"
const productSkus = Platform.select({
    android: [
        'standart_package',
    ]
})
export const constants = {
    productSkus
};