import MapContainer from "../components/Map/MapContainer";

const Phase1Result = () => {
    return (
        <MapContainer 
            stores={[{
                name: "Cửa hàng 1",
                address: "123 Đường ABC, Quận 1, TP.HCM",
                products: ["Sản phẩm 1", "Sản phẩm 2", "Sản phẩm 3"],
                coordinates: { lat: 10.81350, lng: 106.716083 }
            }, {
                name: "Cửa hàng 2",
                address: "456 Đường XYZ, Quận 2, TP.HCM",
                products: ["Sản phẩm 4", "Sản phẩm 5", "Sản phẩm 6"],
                coordinates: { lat: 10.813397, lng:  106.716706}
            }]}
            radius={2000}
        />
    );
};

export default Phase1Result;
