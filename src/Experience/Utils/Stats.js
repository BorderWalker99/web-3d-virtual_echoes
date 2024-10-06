import Stats from 'stats.js'

export default class StatsMonitor
{
    constructor()
    {
        this.active = window.location.hash == '#stats'

        if(this.active)
        {
            this.stats = new Stats()
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }
    }
    updateStart()
    {
        if(this.active)
        {
            this.stats.begin()
        }
    }
    updateEnd()
    {
        if(this.active)
        {
            this.stats.end()
        }
    }
}

