import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import CreateOrderForm from '../components/CreateOrderForm';
import OrderList from '../components/OrderList';

export default function OrderScreen() {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const handleOrderCreated = () => {
        setRefreshFlag(prev => !prev);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Wrap the form in a component that can pass the refresh handler */}
                <View>
                    <CreateOrderForm onOrderCreated={handleOrderCreated} />
                </View>
                <OrderList shouldRefresh={refreshFlag} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    container: {
        flex: 1,
    }
});