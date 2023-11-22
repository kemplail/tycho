import { Card } from 'src/elements/Card'
import { CardTitle } from 'src/elements/CardTitle'
import { PageTitle } from 'src/elements/PageTitle'
import { GeneralFeeling } from 'src/widgets/GeneralFeeling'
import { Statistics } from 'src/widgets/Statistics'
import { TradersRanking } from 'src/widgets/TradersRanking'

function InformationsCenter() {
  return (
    <>
      <PageTitle text="Information center" />
      <div className="space-y-4">
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-4">
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardTitle text="Traders ranking" />
            <TradersRanking />
          </Card>
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardTitle text="General feeling" />
            <GeneralFeeling />
          </Card>
        </div>
        <Card>
          <CardTitle text="Statistics" />
          <Statistics />
        </Card>
      </div>
    </>
  )
}

export default InformationsCenter
