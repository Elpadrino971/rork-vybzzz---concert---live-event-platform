import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '@/lib/api';
import Button from './Button';

interface TipModalProps {
  visible: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
}

const SUGGESTED_AMOUNTS = [2, 5, 10, 20, 50];

export default function TipModal({
  visible,
  onClose,
  artistId,
  artistName,
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSendTip = async () => {
    if (!selectedAmount) {
      Alert.alert('Erreur', 'Veuillez sélectionner un montant');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent for tip
      const { clientSecret, error: apiError } = await api.sendTip(
        artistId,
        selectedAmount
      );

      if (apiError || !clientSecret) {
        throw new Error(
          apiError?.message || 'Erreur lors de la création du paiement'
        );
      }

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'VyBzzZ',
        returnURL: 'vybzzz://payment-success',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Erreur de paiement', paymentError.message);
        }
      } else {
        Alert.alert(
          'Merci !',
          `Votre pourboire de ${selectedAmount}€ a été envoyé à ${artistName}.`
        );
        onClose();
      }
    } catch (error) {
      console.error('Tip error:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.icon}>💝</Text>
          <Text style={styles.title}>Envoyer un pourboire</Text>
          <Text style={styles.subtitle}>à {artistName}</Text>

          <Text style={styles.label}>Choisissez un montant</Text>

          <View style={styles.amountsContainer}>
            {SUGGESTED_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected,
                ]}
                onPress={() => setSelectedAmount(amount)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.amountTextSelected,
                  ]}
                >
                  {amount}€
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.info}>
            90% du montant ira directement à l'artiste
          </Text>

          <Button
            title={`Envoyer ${selectedAmount || 0}€`}
            onPress={handleSendTip}
            loading={loading}
            disabled={!selectedAmount}
            fullWidth
            style={styles.sendButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#718096',
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 12,
  },
  amountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  amountButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B35',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
  },
  amountTextSelected: {
    color: '#FF6B35',
  },
  info: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 20,
  },
  sendButton: {
    marginTop: 8,
  },
});
