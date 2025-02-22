import { Address } from "viem"

export const PASSKEY_FACTORY:
{
    "released": boolean,
    "contractName": string,
    "version": string,
    "networkAddresses": {
        [key: string]: Address
    }
} = {
    "released": true,
    "contractName": "SafeWebAuthnSignerFactory",
    "version": "0.2.1",
    "networkAddresses": {
        "1": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "10": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "137": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "4078": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "8453": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "42161": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "80002": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "84532": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "421614": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "11155111": "0x1d31F259eE307358a26dFb23EB365939E8641195",
        "11155420": "0x1d31F259eE307358a26dFb23EB365939E8641195"
    }
}
export const PASSKEY_FACTORY_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "signer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "P256.Verifiers",
                "name": "verifiers",
                "type": "uint176"
            }
        ],
        "name": "Created",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "SINGLETON",
        "outputs": [
            {
                "internalType": "contract SafeWebAuthnSignerSingleton",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            },
            {
                "internalType": "P256.Verifiers",
                "name": "verifiers",
                "type": "uint176"
            }
        ],
        "name": "createSigner",
        "outputs": [
            {
                "internalType": "address",
                "name": "signer",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            },
            {
                "internalType": "P256.Verifiers",
                "name": "verifiers",
                "type": "uint176"
            }
        ],
        "name": "getSigner",
        "outputs": [
            {
                "internalType": "address",
                "name": "signer",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "message",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "y",
                "type": "uint256"
            },
            {
                "internalType": "P256.Verifiers",
                "name": "verifiers",
                "type": "uint176"
            }
        ],
        "name": "isValidSignatureForSigner",
        "outputs": [
            {
                "internalType": "bytes4",
                "name": "magicValue",
                "type": "bytes4"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

