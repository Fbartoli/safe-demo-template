import { useSafe, useSendSafeOperation } from "@safe-global/safe-react-hooks";

export default function UserOps() {
    const sendUserOps = useSendSafeOperation()

    const safe = useSafe()
    const {
        data,
        // ...
      } = safe.getSafeInfo()
    return (
        <>
            <button onClick={() => sendUserOps.sendSafeOperation({
                transactions: [{
                    to: data?.address!,
                    value: '0',
                    data: '0x'
                }]
            })}>
                send 0 eth
            </button>
            {data && JSON.stringify(data)}
            {sendUserOps.status}
        </>
    )
}