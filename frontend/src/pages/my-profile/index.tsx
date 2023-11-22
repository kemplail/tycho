import { Card } from 'src/elements/Card'
import { CardTitle } from 'src/elements/CardTitle'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { PageTitle } from 'src/elements/PageTitle'
import { Waiting } from 'src/elements/Waiting'
import { useLoggedUserQuery } from 'src/store/rtk/user'
import { TradesUserInformations } from 'src/widgets/TradesUserInformations'
import { TraderUserInformationsBybit } from 'src/widgets/TradesUserInformationsBybit'
import { UserLastTrades } from 'src/widgets/UserLastTrades'
import { UserTraders } from 'src/widgets/UserTraders'

export function MyProfile() {
  return (
    <>
      <PageTitle text="My Profile" />
      <div className="space-y-4">
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-4">
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardTitle text="My Traders" />
            <UserTraders />
          </Card>
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardTitle text="My performances" />
            {/* <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
              <TradesUserInformations />
              <TraderUserInformationsBybit />
            </div> */}
            <div className="flex flex-col space-y-6">
              <TraderUserInformationsBybit />
              <TradesUserInformations />
            </div>
          </Card>
        </div>
        <Card>
          <CardTitle text="My last trades" />
          <UserLastTrades />
        </Card>
      </div>
    </>
  )
}
