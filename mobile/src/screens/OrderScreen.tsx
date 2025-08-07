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
                <CreateOrderForm onOrderCreated={handleOrderCreated} />
                <OrderList shouldRefresh={refreshFlag} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        padding: 20,
    }
});